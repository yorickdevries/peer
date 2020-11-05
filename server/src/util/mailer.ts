import isCI from "is-ci";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Assignment from "../models/Assignment";

const transporter = nodemailer.createTransport({
  host: "smtp.tudelft.nl",
  port: 25,
});

const constructMessage = function (to: string, subject: string, text: string) {
  return {
    from: "noreply@peer.tudelft.nl",
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
  const message = constructMessage(
    "y.c.devries-1@student.tudelft.nl",
    subject,
    text
  );
  return sendMessage(message);
};

const sendMailToTeachersOfAssignment = async function (
  subject: string,
  text: string,
  assignment: Assignment
): Promise<void> {
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
  // also send a message to admin for debugging purposes
  await sendMailToAdmin(subject, text);
};

export { sendMailToTeachersOfAssignment, sendMailToAdmin };
