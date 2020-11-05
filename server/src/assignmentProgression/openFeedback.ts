import { AssignmentState } from "../enum/AssignmentState";
import Assignment from "../models/Assignment";
import submitReview from "../util/submitReview";
import ensureConnection from "../util/ensureConnection";
import { sendMailToAdmin } from "../util/mailer";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";

const openFeedbackForAssignmentHelper = async function (
  assignment: Assignment
): Promise<string> {
  // get assignmentstate
  if (!assignment.isAtState(AssignmentState.REVIEW)) {
    throw new Error("The assignment is not in review state");
  }
  // check whether review evaluation is enabled and questionnaire is present
  if (assignment.reviewEvaluation) {
    for (const assignmentVersion of assignment.versions) {
      if (!assignmentVersion.reviewQuestionnaireId) {
        throw new Error(
          "No reviewQuestionnaire is present to evaluate the reviews"
        );
      }
    }
  }
  for (const assignmentVersion of assignment.versions) {
    const reviewQuestionnaire = await assignmentVersion.getReviewQuestionnaire();
    if (reviewQuestionnaire) {
      if (reviewQuestionnaire.questions.length === 0) {
        throw new Error("The questionnaire doesn't have questions");
      }
      // check whether there is a question without option:
      for (const question of reviewQuestionnaire.questions) {
        if (
          question instanceof CheckboxQuestion ||
          question instanceof MultipleChoiceQuestion
        ) {
          if (question.options.length === 0) {
            throw new Error(
              "One of the questions in the questionnaire doesn't have options"
            );
          }
        }
      }
    }
  }

  //counters
  let submittedCounter = 0;
  let unsubmittedCounter = 0;

  for (const assignmentVersion of assignment.versions) {
    const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
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
        submittedCounter++;
      } catch (error) {
        unsubmittedCounter++;
      }
    }
  }
  assignment.state = AssignmentState.FEEDBACK;
  await assignment.save();
  return `Opened feedback for assignment ${assignment.id}, ${submittedCounter} additional reviews are submitted, ${unsubmittedCounter} reviews are still unsubmitted`;
};

const openFeedbackForAssignment = async function (
  assignmentId: number
): Promise<string> {
  await ensureConnection();
  const assignment = await Assignment.findOneOrFail(assignmentId);
  try {
    const result = await openFeedbackForAssignmentHelper(assignment);
    await sendMailToAdmin("Distributed reviews for assignment", result);
    return result;
  } catch (error) {
    await sendMailToAdmin(
      "Error while distributing reviews for assignment",
      String(error)
    );
    throw error;
  }
};

export default openFeedbackForAssignment;
