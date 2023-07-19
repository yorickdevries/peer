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
import AssignmentVersion from "../models/AssignmentVersion";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import Group from "../models/Group";
import { dataSource } from "../databaseConnection";

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

const constructMessage = function (
  to: string,
  subject: string,
  text: string
): Mail.Options {
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

const sendMessageBatch = async function (messages: Mail.Options[]) {
  for (const mail of messages) {
    await sendMessage(mail);
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

/**
 * Generates an email to group members of a submission that was reviewed late
 *
 * @param submission the submission that was reviewed late
 */
const genMailForLateReview = async function (
  submission: Submission
): Promise<Mail.Options[]> {
  const mailsToSend: Mail.Options[] = [];
  const group = await Group.findOneByOrFail({
    id: submission.groupId,
  });
  const members = await group.getUsers();
  const membersWithDetails = members.filter(
    (m) => m.email !== null && m.firstName !== null
  );

  const assignmentVersion = await AssignmentVersion.findOneByOrFail({
    id: submission.assignmentVersionId,
  });
  const assignment = await Assignment.findOneByOrFail({
    id: assignmentVersion.assignmentId,
  });
  const course = await Course.findOneByOrFail({
    id: assignment.courseId,
  });

  for (const member of membersWithDetails) {
    if (member.preferences.stRemLateSubmission) {
      const { subject, text } = templates[EmailTemplate.LATE_REVIEW_SUBMISSION](
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        member.firstName!,
        course.courseCode,
        assignment.name
      );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mailsToSend.push(constructMessage(member.email!, subject, text));
    }
  }

  return mailsToSend;
};

/**
 * Sends an email to group members of a review that was evaluated late
 *
 * @param reviewOfSubmissionId the ID of the submission review that was evaluated late
 */
const genMailForLateEvaluation = async function (
  reviewOfSubmissionId: number
): Promise<Mail.Options[]> {
  const mailsToSend: Mail.Options[] = [];
  const review = await ReviewOfSubmission.findOneByOrFail({
    id: reviewOfSubmissionId,
  });
  const reviewUser = review.reviewer;
  const submission = review.submission;

  if (reviewUser.email === null || reviewUser.firstName === null) {
    return mailsToSend;
  }

  const assignmentVersion = await AssignmentVersion.findOneByOrFail({
    id: submission.assignmentVersionId,
  });
  const assignment = await Assignment.findOneByOrFail({
    id: assignmentVersion.assignmentId,
  });
  const course = await Course.findOneByOrFail({
    id: assignment.courseId,
  });

  if (reviewUser.preferences.stRemLateSubmission) {
    const { subject, text } = templates[
      EmailTemplate.LATE_EVALUATION_SUBMISSION
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ](reviewUser.firstName!, course.courseCode, assignment.name);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mailsToSend.push(constructMessage(reviewUser.email!, subject, text));
  }

  return mailsToSend;
};

/**
 * Checks whether a reminder mail should be sent (if the deadline is tomorrow)
 *
 * @param runDate the current date
 * @param date the deadline
 * @returns whether a reminder email should be sent
 */
const shouldSendReminderMail = function (date: Date, runDate: Moment): boolean {
  const dueDateMinusDay = moment(date).clone().subtract(1, "days");
  return dueDateMinusDay.isSame(runDate, "day");
};

/**
 * Generates an email to group members of a submission / review / evaluation if it
 * hasn't yet been submitted one day before the deadline
 */
const genMailForMissingStageSubmission = async function (): Promise<
  Mail.Options[]
> {
  const mailsToSend: Mail.Options[] = [];
  const assignments = await Assignment.find();
  const today = moment();
  const runDate = today.clone().startOf("day");
  for (const assignment of assignments) {
    const curState = assignment.state;
    const course = await Course.findOneByOrFail({
      id: assignment.courseId,
    });

    switch (curState) {
      case AssignmentState.SUBMISSION: {
        //Skip assignments that are outside the time window
        if (!shouldSendReminderMail(assignment.dueDate, runDate)) {
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

            //Construct and send message
            const { subject, text } = templates[
              EmailTemplate.NO_SUBMISSION_YET
            ](
              member.firstName,
              course.courseCode,
              assignment.name,
              assignment.dueDate.toString()
            );

            mailsToSend.push(constructMessage(member.email, subject, text));
          }
        }
        break;
      }
      case AssignmentState.REVIEW: {
        //Skip assignments that are outside the time window
        if (!shouldSendReminderMail(assignment.reviewDueDate, runDate)) {
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

            //Construct and send message
            const { subject, text } = templates[EmailTemplate.NO_REVIEW_YET](
              member.firstName,
              course.courseCode,
              assignment.name,
              assignment.reviewDueDate.toString()
            );
            mailsToSend.push(constructMessage(member.email, subject, text));
          }
        }
        break;
      }
      case AssignmentState.FEEDBACK: {
        //Skip assignments with review feedback disabled
        if (!assignment.reviewEvaluation) {
          break;
        }

        //Skip assignments that are outside the time window
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (
          !shouldSendReminderMail(assignment.reviewEvaluationDueDate!, runDate)
        ) {
          break;
        }

        const groups = await assignment.getGroups();
        for (const group of groups) {
          //Skip those who haven't made submissions (they won't have reviews to evaluate)
          if (!(await Submission.hasGroupMadeSubmission(group.id))) {
            continue;
          }

          // send email to group members
          const members = await group.getUsers();
          const memberNetIds = members.map((m) => m.netid);

          //Get all reviews that this group has received
          const reviews =
            await assignment.getSubmittedReviewsWhereUserIsReviewed(group);

          for (const review of reviews) {
            //Check if received review has an associated feedback review (made by the user(s) in question)
            const feedbackReview = await dataSource.manager
              .createQueryBuilder(ReviewOfReview, "review")
              .where("review.reviewOfSubmission = :rid", { rid: review.id })
              .andWhere("review.reviewer IN (:...reviewers)", {
                reviewers: memberNetIds,
              })
              .getOne();

            //Skip if feedback review found
            if (feedbackReview !== undefined) {
              continue;
            }

            for (const member of members) {
              //Skip this user if required fields aren't present
              if (member.email === null || member.firstName === null) {
                continue;
              }

              //Skip if user disabled this type of email
              if (!member.preferences.stRemStageNotSubmitted) {
                continue;
              }

              //Skip those who haven't completed all their reviews and blockFeedback is enabled
              if (
                assignment.blockFeedback &&
                (await assignment.hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(
                  member
                ))
              ) {
                continue;
              }

              //Construct and send message
              const { subject, text } = templates[
                EmailTemplate.NO_EVALUATION_YET
              ](
                member.firstName,
                course.courseCode,
                assignment.name,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                assignment.reviewEvaluationDueDate!.toString()
              );
              mailsToSend.push(constructMessage(member.email, subject, text));
            }
            break;
          }
        }
        break;
      }
    }
  }
  return mailsToSend;
};

export {
  sendMailToTeachersOfAssignment,
  sendMailToAdmin,
  genMailForMissingStageSubmission,
  genMailForLateReview,
  genMailForLateEvaluation,
  sendMessageBatch,
};
