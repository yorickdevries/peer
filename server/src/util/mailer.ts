import isCI from "is-ci";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Assignment from "../models/Assignment";
import config from "config";
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

const sendTimedMails = true;
const emailList: Mail.Options[] = [];

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

const sendAssignmentPublishedMail = async function (
  assignment: Assignment
): Promise<void> {
  const emails = await assignment.getAllStudentEmails();
  const courseCode = (await Course.findOneOrFail(assignment.id)).courseCode;
  for (const email of emails) {
    const emailTemplate = constructMessage(
      email,
      `{${courseCode}} - Assignment Published`,
      `Assignment '${assignment.name}' is now open for submissions.
    
    Make sure to submit before the deadline!`
    );
    emailList.push(emailTemplate);
  }
};

const delay = function (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const emailSendLoop = async function (): Promise<void> {
  while (sendTimedMails) {
    const email = emailList.pop();
    if (email !== undefined) {
      await sendMessage(email);
    }
    await delay(2 * 1000);
  }
};

export {
  sendMailToTeachersOfAssignment,
  sendMailToAdmin,
  sendAssignmentPublishedMail,
  emailSendLoop,
};
