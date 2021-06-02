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
  const assignmentVersion = await submissionQuestionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();

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

    const annotations =
      assignment.assignmentType === "document"
        ? await review.getPDFAnnotations()
        : await review.getCodeAnnotations();

    // id
    parsedReview["id"] = review.id;

    // SUBMITTER
    // Submitter netid
    parsedReview["Submitter netid"] = submitter.netid;
    // Submitter studentnumber
    parsedReview["Submitter studentnumber"] = submitter.studentNumber;
    // Submitter group id
    parsedReview["Submitter group id"] = submitterGroup.id;
    // Submitter group name
    parsedReview["Submitter group name"] = submitterGroup.name;

    // REVIEWER
    // Reviewer netid
    parsedReview["Reviewer netid"] = reviewer.netid;
    // Reviewer studentnumber
    parsedReview["Reviewer studentnumber"] = reviewer.studentNumber;
    // Reviewer group id
    parsedReview["Reviewer group id"] = reviewerGroup?.id;
    // Reviewer group name
    parsedReview["Reviewer group name"] = reviewerGroup?.name;

    // REVIEW INFO
    // Submission review started_at
    parsedReview["Submissionreview started at"] = review.startedAt;
    // Submission review downloaded_at
    parsedReview["Submissionreview downloaded at"] = review.downloadedAt;
    // Submission review submitted_at
    parsedReview["Submissionreview submitted at"] = review.submittedAt;
    // Submission review done
    parsedReview["Submissionreview submitted"] = review.submitted;
    // Approval status
    parsedReview["Submissionreview approval by TA"] = review.approvalByTA;
    // commentByTA
    parsedReview["Submissionreview comment by TA"] = review?.commentByTA;
    // TA netid
    parsedReview["Submissionreview TA netid"] = review.approvingTA?.netid;
    // Reviewer reported the submission
    parsedReview["Submissionreview Reviewer reported the submission"] =
      review.flaggedByReviewer;

    // number of annotations in review
    parsedReview["number of annotations"] = annotations.length;

    // QUESTIONS
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

    // EVALUATOR
    // Evaluator netid
    parsedReview["Evaluator netid"] = reviewEvaluationReviewer?.netid;
    // Evaluator studentnumber
    parsedReview["Evaluator studentnumber"] =
      reviewEvaluationReviewer?.studentNumber;

    // Review evaluation started_at
    parsedReview["Reviewevaluation started at"] = reviewEvaluation?.startedAt;
    // Review evaluation downloaded_at
    parsedReview["Reviewevaluation downloaded at"] =
      reviewEvaluation?.downloadedAt;
    // Review evaluation submitted_at
    parsedReview["Reviewevaluation submitted at"] =
      reviewEvaluation?.submittedAt;
    // Submission review done
    parsedReview["Reviewevaluation submitted"] = reviewEvaluation?.submitted;
    // Approval status
    parsedReview["Reviewevaluation approval by TA"] =
      reviewEvaluation?.approvalByTA;
    // commentByTA
    parsedReview["Reviewevaluation comment by TA"] =
      reviewEvaluation?.commentByTA;
    // TA netid
    parsedReview["Reviewevaluation TA netid"] =
      reviewEvaluation?.approvingTA?.netid;
    // Reviewer reported the submission
    parsedReview["Reviewevaluation Reviewer reported the submission"] =
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
