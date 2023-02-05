import isCI from "is-ci";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Assignment from "../models/Assignment";
import config from "config";
import { AssignmentState } from "../enum/AssignmentState";
import moment, { Moment } from "moment";
import Submission from "../models/Submission";
import { EmailTemplate, templates } from "../enum/EmailTemplate";
import Course from "../models/Course";
import ReviewOfReview from "../models/ReviewOfReview";
import { Any } from "typeorm";
import User from "../models/User";

const mailConfig: {
  host: string;
  port: number;
  from: string;
  adminMail: string;
} = config.get("mail");

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
});

const constructMessage = function (to: string, subject: string, text: string) {
  return {
    from: mailConfig.from,
    to: to,
    subject: "[Peer] " + subject,
    text: text,
  };
};

const sendMessage = async function (message: Mail.Options) {
  if (process.env.NODE_ENV === "production" && !isCI) {
    await transporter.sendMail(message);
  } else {
    console.log(
      `Mail that will be sent in production: ${JSON.stringify(message)}`
    );
  }
};

const sendMailToAdmin = async function (
  subject: string,
  text: string
): Promise<void> {
  const message = constructMessage(mailConfig.adminMail, subject, text);
  return sendMessage(message);
};

const sendMailToTeachersOfAssignment = async function (
  subject: string,
  text: string,
  assignment: Assignment
): Promise<void> {
  if (assignment.sendNotificationEmails) {
    const course = await assignment.getCourse();
    const teacherEnrollments = await course.getTeacherEnrollments();
    for (const teacherEnrollment of teacherEnrollments) {
      const teacher = await teacherEnrollment.getUser();
      // only send mail if a mail adress is known
      if (teacher.email) {
        const message = constructMessage(teacher.email, subject, text);
        await sendMessage(message);
      }
    }
  }
  // also send a message to admin for debugging purposes
  await sendMailToAdmin(subject, text);
};

const shouldSendReminderMail = function (
  date: Date,
  runDate: Moment,
  prevRunDate: Moment
): boolean {
  const dueDateMinusDay = moment(date).clone().subtract(1, "days");
  return dueDateMinusDay.isBetween(prevRunDate, runDate, undefined, "[)");
};

const sendMailForMissingStageSubmission = async function (): Promise<void> {
  const assignments = await Assignment.find();
  //const curDate = new Date();
  for (const assignment of assignments) {
    const curState = assignment.state;
    const today = moment();
    const runDate = today.clone().startOf("day");
    const prevRunDate = today.clone().subtract(1, "days").startOf("day");

    const course = await Course.findOneOrFail(assignment.courseId);

    switch (curState) {
      case AssignmentState.SUBMISSION: {
        //Skip assignments that are outside the time window
        if (!shouldSendReminderMail(assignment.dueDate, runDate, prevRunDate)) {
          break;
        }

        const groups = await assignment.getGroups();
        for (const group of groups) {
          //Skip those who have already made a submission
          if (await Submission.hasGroupMadeSubmission(group.id)) {
            continue;
          }

          // send email to group members
          const members = await group.getUsers();
          for (const member of members) {
            //Skip this user if required fields aren't present
            if (member.email === null || member.firstName === null) {
              continue;
            }

            //Skip this user if they don't want these emails
            if (!member.preferences.stRemStageNotSubmitted) {
              continue;
            }

            const { subject, text } = templates[
              EmailTemplate.NO_SUBMISSION_YET
            ](
              member.firstName,
              course.courseCode,
              assignment.name,
              assignment.dueDate.toString()
            );

            await sendMessage(constructMessage(member.email, subject, text));
          }
        }
        break;
      }
      case AssignmentState.REVIEW: {
        //Skip assignments that are outside the time window
        if (
          !shouldSendReminderMail(
            assignment.reviewDueDate,
            runDate,
            prevRunDate
          )
        ) {
          break;
        }

        const groups = await assignment.getGroups();
        for (const group of groups) {
          //Skip those who haven't made submissions (they won't have reviews to submit)
          if (!(await Submission.hasGroupMadeSubmission(group.id))) {
            continue;
          }

          // send email to group members
          const members = await group.getUsers();
          for (const member of members) {
            //Skip this user if required fields aren't present
            if (member.email === null || member.firstName === null) {
              continue;
            }

            //Skip this user if they don't want these emails
            if (!member.preferences.stRemStageNotSubmitted) {
              continue;
            }

            //Skip those who have completed all assigned reviews
            if (
              !(await assignment.hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(
                member
              ))
            ) {
              continue;
            }
            const { subject, text } = templates[EmailTemplate.NO_REVIEW_YET](
              member.firstName,
              course.courseCode,
              assignment.name,
              assignment.reviewDueDate.toString()
            );
            await sendMessage(constructMessage(member.email, subject, text));
          }
        }
        break;
      }
      case AssignmentState.FEEDBACK: {
        //Skip assignments that are outside the time window
        if (
          !shouldSendReminderMail(
            assignment.reviewDueDate,
            runDate,
            prevRunDate
          )
        ) {
          break;
        }

        //Skip assignments with review feedback disabled
        if (!assignment.reviewEvaluation) {
          break;
        }

        const groups = await assignment.getGroups();
        for (const group of groups) {
          //Skip those who haven't made submissions (they won't have reviews to submit)
          if (!(await Submission.hasGroupMadeSubmission(group.id))) {
            continue;
          }

          // send email to group members
          const members = await group.getUsers();
          const membersWithDetails = members.filter(
            (m) => m.email !== null && m.firstName !== null
          );

          //Get all reviews that this group has received
          const reviews =
            await assignment.getSubmittedReviewsWhereUserIsReviewed(group);

          for (const review of reviews) {
            //Check if received review has an associated feedback review (made by the user(s) in question)
            const feedbackReview = await ReviewOfReview.findOne({
              where: {
                reviewOfSubmissionId: review.id,
                reviewer: Any(members),
              },
            });

            //Send mail if no associated feedback review found and stop
            if (feedbackReview === undefined) {
              for (const member of membersWithDetails) {
                //Skip if user disabled this type of email
                if (!member.preferences.stRemStageNotSubmitted) {
                  continue;
                }

                const { subject, text } = templates[
                  EmailTemplate.NO_EVALUATION_YET
                ](
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  member.firstName!,
                  course.courseCode,
                  assignment.name,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  assignment.reviewEvaluationDueDate!.toString()
                );
                await sendMessage(
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  constructMessage(member.email!, subject, text)
                );
              }
              break;
            }
          }
        }
        break;
      }
    }
  }
};

export {
  sendMailToTeachersOfAssignment,
  sendMailToAdmin,
  sendMailForMissingStageSubmission,
};
