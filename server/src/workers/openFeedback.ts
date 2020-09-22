import { AssignmentState } from "../enum/AssignmentState";
import Assignment from "../models/Assignment";
import submitReview from "../util/submitReview";
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
  // note: for every review a transaction is started to check review validity
  for (const review of unsubmittedReviews) {
    // try to submit every review
    try {
      await submitReview(review);
    } catch (error) {
      console.log(error);
    }
  }
  assignment.state = AssignmentState.FEEDBACK;
  await assignment.save();
  return `Opened feedback for assignment ${assignment.id}`;
};

export default openFeedbackForAssignment;
