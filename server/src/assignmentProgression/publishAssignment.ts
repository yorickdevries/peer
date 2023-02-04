import Assignment from "../models/Assignment";
import { AssignmentState } from "../enum/AssignmentState";
import { sendMailToTeachersOfAssignment } from "../util/mailer";
import ensureConnection from "../util/ensureConnection";

const publishAssignmentHelper = async function (assignment: Assignment) {
  if (!assignment.isAtState(AssignmentState.UNPUBLISHED)) {
    throw new Error("The assignment is not in unpublished state");
  }
  if (assignment.versions.length === 0) {
    throw new Error("No assignment versions have been defined");
  }
  assignment.state = AssignmentState.SUBMISSION;
  await assignment.save();
  return `Published assignment: ${assignment.name} ID: ${assignment.id}`;
};

const publishAssignment = async function (
  assignmentId: number
): Promise<string> {
  await ensureConnection();
  const assignment = await Assignment.findOneOrFail(assignmentId);
  try {
    const result = await publishAssignmentHelper(assignment);
    await sendMailToTeachersOfAssignment(
      "Published assignment",
      result,
      assignment
    );
    return result;
  } catch (error) {
    await sendMailToTeachersOfAssignment(
      "Error while publishing assignment",
      String(error),
      assignment
    );
    throw error;
  }
};

export default publishAssignment;
