import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.tudelft.nl",
  secure: true,
});

// verify connection configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
transporter.verify((error, _success) => {
  if (error) {
    console.log(error);
    console.log("Server is not ready");
  } else {
    console.log("Server is ready to take our messages");
  }
});

const sendTestMail = function (text: string): Promise<void> {
  const message = {
    from: "noreply@peer.tudelft.nl",
    to: "y.c.devries-1@student.tudelft.nl",
    subject: "Test mail from Peer",
    text: text,
  };
  return transporter.sendMail(message);
};

export default sendTestMail;
