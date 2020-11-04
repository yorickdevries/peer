import createDatabaseConnection from "../databaseConnection";
import Submission from "../models/Submission";
import SubmissionComment from "../models/SubmissionComment";
import User from "../models/User";

const migrateComment = async function () {
  const submission = await Submission.findOneOrFail(1751);
  const user = await User.findOneOrFail("christoskoutra");
  const comments = await SubmissionComment.find({
    where: {
      submission: submission,
    },
  });
  let fullComment = "";
  for (const comment of comments) {
    fullComment += comment.text;
    fullComment += "\n";
  }
  submission.approvalByTA = true;
  submission.approvingTA = user;
  submission.commentByTA = fullComment;
  await submission.save();
  console.log(submission);
};

createDatabaseConnection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .then((_connection) => {
    migrateComment()
      .then(() => {
        console.log("Done");
        process.exit(0);
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
