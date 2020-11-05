import Assignment from "../models/Assignment";
import { AssignmentState } from "../enum/AssignmentState";
import { sendMailToAdmin } from "../util/mailer";

const closeSubmissionHelper = async function (assignment: Assignment) {
  if (!assignment.isAtState(AssignmentState.SUBMISSION)) {
    throw new Error("The assignment is not in submission state");
  }
  for (const assignmentVersion of assignment.versions) {
    const submissions = await assignmentVersion.getFinalSubmissionsOfEachGroup();
    if (submissions.length === 0) {
      throw new Error(
        "There are no submissions for one of the assignment versions"
      );
    }
  }
  assignment.state = AssignmentState.WAITING_FOR_REVIEW;
  await assignment.save();
  return `Closed submissions for assignment: ${assignment.name} ID: ${assignment.id}`;
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
