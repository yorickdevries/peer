import { AssignmentState } from "../enum/AssignmentState";
import Assignment from "../models/Assignment";
import ensureConnection from "./ensureConnection";

const openFeedbackForAssignment = async function (
  assignmentId: number
): Promise<string> {
  await ensureConnection();

  const assignment = await Assignment.findOneOrFail(assignmentId);
  const questionnaire = await assignment.getSubmissionQuestionnaire();
  if (!questionnaire) {
    throw new Error("No questionnaire found");
  }
  const submitted = false;
  const unsubmittedReviews = await questionnaire.getReviews(submitted);
  for (const review of unsubmittedReviews) {
    if (await review.canBeSubmitted()) {
      review.submitted = true;
      review.submittedAt = new Date();
      await review.save();
    }
  }
  assignment.state = AssignmentState.FEEDBACK;
  await assignment.save();
  return `Opened feedback for assignment ${assignment.id}`;
};

export default openFeedbackForAssignment;
