import isCI from "is-ci";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.tudelft.nl",
  port: 25,
});

const sendMailToAdmin = async function (
  subject: string,
  text: string
): Promise<void> {
  const message = {
    from: "noreply@peer.tudelft.nl",
    to: "y.c.devries-1@student.tudelft.nl",
    subject: "[Peer] " + subject,
    text: text,
  };
  if (process.env.NODE_ENV === "production" && !isCI) {
    await transporter.sendMail(message);
  } else {
    console.log(
      `Mail that will be sent in production: ${JSON.stringify(message)}`
    );
  }
};

export { sendMailToAdmin };
