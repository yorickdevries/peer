import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import _ from "lodash";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import Question from "../models/Question";

const parseSubmissionReviewsForExport = async function (
  submissionQuestionnaire: SubmissionQuestionnaire
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  // iterate over all reviews and save the data
  const questions = _.sortBy(submissionQuestionnaire.questions, (question) => {
    return question.number;
  });
  const reviews = (await submissionQuestionnaire.getReviews()) as ReviewOfSubmission[];
  const assignment = await submissionQuestionnaire.getAssignment();

  // the parsed review is too extensive to make an interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedReviews: any[] = [];
  for (const review of reviews) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedReview: any = {};
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const submission = review.submission!;

    const submitter = await submission.getUser();
    const submitterGroup = await submission.getGroup();

    const reviewer = review.reviewer;
    const reviewerGroup = await assignment.getGroup(reviewer);

    // id
    parsedReview["id"] = review.id;
    // Submitter netid
    parsedReview["Submitter netid"] = submitter.netid;
    // Submitter studentnumber
    parsedReview["Submitter studentnumber"] = submitter.studentNumber;
    // Submitter group id
    parsedReview["Submitter group id"] = submitterGroup.id;
    // Submitter group name
    parsedReview["Submitter group name"] = submitterGroup.name;
    // Reviewer netid
    parsedReview["Reviewer netid"] = reviewer.netid;
    // Reviewer studentnumber
    parsedReview["Reviewer studentnumber"] = reviewer.studentNumber;
    // Reviewer group id
    parsedReview["Reviewer group id"] = reviewerGroup?.id;
    // Reviewer group name
    parsedReview["Reviewer group name"] = reviewerGroup?.name;
    // Submission review started_at
    parsedReview["Submission review started_at"] = review.startedAt;
    // Submission review downloaded_at
    parsedReview["Submission review downloaded_at"] = review.downloadedAt;
    // Submission review submitted_at
    parsedReview["Submission review submitted_at"] = review.submittedAt;
    // Submission review done
    parsedReview["Submission review done"] = review.submitted;
    // Approval status
    parsedReview["Submission review Approval status"] = review.approvalByTA;
    // TA netid
    parsedReview["Submission review TA netid"] = review.approvingTA?.netid;
    // Reviewer reported the submission
    parsedReview["Submission review Reviewer reported the submission"] =
      review.flaggedByReviewer;

    // iterate over all questions
    for (const question of questions) {
      const questionText = `R${question.number}. ${question.text}`;
      const answer = await review.getAnswer(question);
      const answerText = answer?.getAnswerText();
      parsedReview[questionText] = answerText;
    }

    const reviewEvaluation = await review.getReviewOfThisReview();
    const reviewEvaluationQuestionnaire = await reviewEvaluation?.getQuestionnaire();
    let reviewEvaluationQuestions: Question[] = [];
    if (reviewEvaluationQuestionnaire) {
      reviewEvaluationQuestions = _.sortBy(
        reviewEvaluationQuestionnaire.questions,
        (question) => {
          return question.number;
        }
      );
    }
    const reviewEvaluationReviewer = reviewEvaluation?.reviewer;

    // Evaluator netid
    parsedReview["Evaluator netid"] = reviewEvaluationReviewer?.netid;
    // Evaluator studentnumber
    parsedReview["Evaluator studentnumber"] =
      reviewEvaluationReviewer?.studentNumber;
    // Review evaluation started_at
    parsedReview["Review evaluation started_at"] = reviewEvaluation?.startedAt;
    // Review evaluation downloaded_at
    parsedReview["Review evaluation downloaded_at"] =
      reviewEvaluation?.downloadedAt;
    // Review evaluation submitted_at
    parsedReview["Review evaluation submitted_at"] =
      reviewEvaluation?.submittedAt;
    // Submission review done
    parsedReview["Review evaluation done"] = reviewEvaluation?.submitted;
    // Approval status
    parsedReview["Review evaluation Approval status"] =
      reviewEvaluation?.approvalByTA;
    // TA netid
    parsedReview["Review evaluation TA netid"] =
      reviewEvaluation?.approvingTA?.netid;
    // Reviewer reported the submission
    parsedReview["Review evaluation Reviewer reported the submission"] =
      reviewEvaluation?.flaggedByReviewer;

    // iterate over all questions
    for (const question of reviewEvaluationQuestions) {
      const questionText = `E${question.number}. ${question.text}`;
      const answer = await reviewEvaluation?.getAnswer(question);
      const answerText = answer?.getAnswerText();
      parsedReview[questionText] = answerText;
    }
    parsedReviews.push(parsedReview);
  }
  return parsedReviews;
};

export default parseSubmissionReviewsForExport;
