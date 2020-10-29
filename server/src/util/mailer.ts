import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.tudelft.nl",
  port: 25,
});

const sendStartupMail = function (text: string): Promise<void> {
  const message = {
    from: "noreply@peer.tudelft.nl",
    to: "y.c.devries-1@student.tudelft.nl",
    subject: "Startup mail from Peer",
    text: text,
  };
  return transporter.sendMail(message);
};

export { sendStartupMail };
