import Assignment from "../models/Assignment";
import { AssignmentState } from "../enum/AssignmentState";
import { sendMailToTeachersOfAssignment } from "../util/mailer";
import ensureConnection from "../util/ensureConnection";

const closeSubmissionHelper = async function (assignment: Assignment) {
  if (!assignment.isAtState(AssignmentState.SUBMISSION)) {
    throw new Error("The assignment is not in submission state");
  }
  for (const assignmentVersion of assignment.versions) {
    const submissions =
      await assignmentVersion.getFinalSubmissionsOfEachGroup();
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

const closeSubmission = async function (assignmentId: number): Promise<string> {
  await ensureConnection();
  const assignment = await Assignment.findOneOrFail(assignmentId);
  try {
    const result = await closeSubmissionHelper(assignment);
    await sendMailToTeachersOfAssignment(
      "Closed submissions for assignment",
      result,
      assignment
    );
    return result;
  } catch (error) {
    await sendMailToTeachersOfAssignment(
      "Error while closing submissions for assignment",
      String(error),
      assignment
    );
    throw error;
  }
};

export default closeSubmission;
