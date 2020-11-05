import Assignment from "../models/Assignment";
import { sendMailToAdmin } from "../util/mailer";

const closeSubmissionHelper = async function (assignment: Assignment) {
  return `TODO ${assignment}`;
};

const closeSubmission = async function (
  assignment: Assignment
): Promise<string> {
  try {
    const result = await closeSubmissionHelper(assignment);
    await sendMailToAdmin("Closed submissions for assignment", result);
    return result;
  } catch (error) {
    await sendMailToAdmin(
      "Error while closing submissions for assignment",
      error
    );
    throw error;
  }
};

export default closeSubmission;
