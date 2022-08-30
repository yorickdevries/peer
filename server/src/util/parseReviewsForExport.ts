import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import _ from "lodash";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import Question from "../models/Question";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionAnswer from "../models/CheckboxQuestionAnswer";
import AssignmentType from "../enum/AssignmentType";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";

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
      assignment.assignmentType === AssignmentType.DOCUMENT
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
    let totalPoints = 0;
    let totalMaxPoints = 0;
    for (const question of questions) {
      if (question instanceof MultipleChoiceQuestion) {
        const q = question as MultipleChoiceQuestion;
        const maxPoints = q.getMaxPointsFromQuestion();
        if (maxPoints) {
          totalMaxPoints += maxPoints;
        }
      } else if (question instanceof CheckboxQuestion) {
        const q = question as CheckboxQuestion;
        const maxPoints = q.getMaxPointsFromQuestion();
        if (maxPoints) {
          totalMaxPoints += maxPoints;
        }
      }
    }

    for (const question of questions) {
      const questionText = `R${question.number}. ${question.text}`;
      // answer in text form
      const answer = await review.getAnswer(question);
      const answerText = answer?.getAnswerText();
      parsedReview[questionText] = answerText;
    }

    for (const question of questions) {
      const questionText = `R${question.number}. ${question.text}`;
      const answer = await review.getAnswer(question);
      if (question.graded) {
        let points = await answer?.getAnswerPoints();
        if (points !== undefined) {
          // divide by 100 for export
          points = points / 100;
        }
        const pointsQuestionText = questionText + " (POINTS)";
        // answer in total points form
        parsedReview[pointsQuestionText] = points;
        if (points) {
          totalPoints += points;
        }
        if (question instanceof CheckboxQuestion) {
          let pointsList = undefined;
          if (answer instanceof CheckboxQuestionAnswer) {
            pointsList = await answer.getAnswerPointsList();
          }
          if (pointsList instanceof Array) {
            const fractionalPointsList = [];
            for (const points of pointsList) {
              // divide by 100 for export
              fractionalPointsList.push(points / 100);
            }
            pointsList = String(fractionalPointsList);
          }
          const pointsListQuestionText = questionText + " (POINTS LIST)";
          // answer in points list form
          parsedReview[pointsListQuestionText] = pointsList;
        }
      }
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

    // iterate over all questions
    for (const question of reviewEvaluationQuestions) {
      const questionText = `E${question.number}. ${question.text}`;
      const answer = await reviewEvaluation?.getAnswer(question);
      const answerText = answer?.getAnswerText();
      // answer in text form
      parsedReview[questionText] = answerText;
      if (question.graded) {
        let points = await answer?.getAnswerPoints();
        if (points !== undefined) {
          // divide by 100 for export
          points = points / 100;
        }
        const pointsQuestionText = questionText + " (POINTS)";
        // answer in total points form
        parsedReview[pointsQuestionText] = points;
        if (question instanceof CheckboxQuestion) {
          let pointsList = undefined;
          if (answer instanceof CheckboxQuestionAnswer) {
            pointsList = await answer.getAnswerPointsList();
          }
          if (pointsList instanceof Array) {
            const fractionalPointsList = [];
            for (const points of pointsList) {
              // divide by 100 for export
              fractionalPointsList.push(points / 100);
            }
            pointsList = String(fractionalPointsList);
          }
          const pointsListQuestionText = questionText + " (POINTS LIST)";
          // answer in points list form
          parsedReview[pointsListQuestionText] = pointsList;
        }
      }
    }
    parsedReview["Total number of points"] = totalPoints;
    parsedReview["Maximum points achievable"] = totalMaxPoints / 100;

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

    parsedReviews.push(parsedReview);
  }

  return parsedReviews;
};

export default parseSubmissionReviewsForExport;
