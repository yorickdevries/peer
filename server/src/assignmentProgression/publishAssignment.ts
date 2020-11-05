import Assignment from "../models/Assignment";
import { AssignmentState } from "../enum/AssignmentState";
import { sendMailToAdmin } from "../util/mailer";

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
  assignment: Assignment
): Promise<string> {
  try {
    const result = await publishAssignmentHelper(assignment);
    await sendMailToAdmin("Published assignment", result);
    return result;
  } catch (error) {
    await sendMailToAdmin("Error while publishing assignment", String(error));
    throw error;
  }
};

export default publishAssignment;
