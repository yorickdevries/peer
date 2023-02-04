import isCI from "is-ci";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Assignment from "../models/Assignment";
import config from "config";
import { AssignmentState } from "../enum/AssignmentState";
import moment from "moment";
import Submission from "../models/Submission";
import {EmailTemplate, templates} from "../enum/EmailTemplate";
import Course from "../models/Course";

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

const sendMailForMissingStageSubmission = async function (): Promise<void> {
  const assignments = await Assignment.find();
  //const curDate = new Date();
  for (const assignment of assignments) {
    const curState = assignment.state;
    /*
    const curStateIndex = assignmentStateOrder.indexOf(curState);
    const nextState =
      curStateIndex + 1 < assignmentStateOrder.length
        ? assignmentStateOrder[curStateIndex + 1]
        : null;

    //Skip assignment if in feedback period and no reviewEvaluations
    if (nextState === null && !assignment.reviewEvaluation) continue;
    //Skip assignments if in feedback period and reviewEvaluations but date has passed
    if (
      nextState === null &&
      assignment.reviewEvaluation &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      assignment.reviewEvaluationDueDate! < curDate
    )
      continue;
  */
    const today = moment();
    const yesterday = today.clone().subtract(1, "days");
    const runDate = today.clone().hour(1).minute(0).second(0).millisecond(0);
    const prevRunDate = runDate.clone().subtract(1, "days");

    const course = await Course.findOneOrFail(assignment.courseId);

    switch (curState) {
      case AssignmentState.SUBMISSION: {
        const dueDateMinusDay = moment(assignment.dueDate).subtract(1, "days");
        if (dueDateMinusDay.isBetween(prevRunDate, runDate, undefined, "[)")) {
          const groups = await assignment.getGroups();
          for (const group of groups) {
            if (!(await Submission.hasGroupMadeSubmission(group.id))) {
              // send email to group members
              const members = await group.getUsers();
              for (const member of members) {
                if (member.email === null || member.firstName === null) continue;
                const { subject, text } = templates[
                  EmailTemplate.NO_SUBMISSION_YET
                ](
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  member.firstName,
                  course.courseCode,
                  assignment.name,
                  assignment.dueDate.toString()
                );
                const message = await sendMessage(
                  constructMessage(member.email, subject, text)
                );
              }
            }
          }
        }
        break;
      }
    }

    console.log("hey");
  }
};

export {
  sendMailToTeachersOfAssignment,
  sendMailToAdmin,
  sendMailForMissingStageSubmission,
};
