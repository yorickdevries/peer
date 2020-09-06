import express from "express";
import Joi from "@hapi/joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import RangeQuestion from "../models/RangeQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import RangeQuestionAnswer from "../models/RangeQuestionAnswer";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import moment from "moment";
import { getManager } from "typeorm";

const router = express.Router();

// Joi inputvalidation
const rangeAnswerSchema = Joi.object({
  rangeQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
  rangeAnswer: Joi.number().integer().required(),
});
// post an rangeAnswer
// overwrites existing if already exists
router.post("/", validateBody(rangeAnswerSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const question = await RangeQuestion.findOne(req.body.rangeQuestionId);
  if (!question) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.QUESTION_NOT_FOUND);
    return;
  }
  const review = await Review.findOne(req.body.reviewId);
  if (!review) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (!(await review.isReviewer(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not the reviewer of this review");
    return;
  }
  if (review.submitted) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The review is already submitted");
    return;
  }
  const questionnaire = await review.getQuestionnaire();
  if (!questionnaire.containsQuestion(question)) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("The question is not part of this review");
    return;
  }
  const assignment = await questionnaire.getAssignment();
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    !(
      assignment.isAtState(AssignmentState.FEEDBACK) &&
      moment().isBefore(assignment.reviewEvaluationDueDate)
    )
  ) {
    res.status(HttpStatusCode.FORBIDDEN).send("The reviewevaluation is passed");
    return;
  }
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    !assignment.lateSubmissionReviews &&
    moment().isAfter(assignment.reviewDueDate)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(
        "The due date for submissionReview has passed and late submission reviews are not allowed by the teacher"
      );
    return;
  }
  let rangeAnswer: RangeQuestionAnswer | undefined;
  // make or overwrite rangeAnswer;
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      rangeAnswer = await transactionalEntityManager.findOne(
        RangeQuestionAnswer,
        {
          where: {
            reviewId: review.id,
            questionId: question.id,
          },
        }
      );
      if (rangeAnswer) {
        rangeAnswer.rangeAnswer = req.body.rangeAnswer;
      } else {
        rangeAnswer = new RangeQuestionAnswer(
          question,
          review,
          req.body.rangeAnswer
        );
      }
      await transactionalEntityManager.save(rangeAnswer);
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await rangeAnswer!.reload();
  res.send(rangeAnswer);
});

// Joi inputvalidation
const deleteRangeAnswerSchema = Joi.object({
  rangeQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
});
// delete an rangeAnswer
router.delete("/", validateQuery(deleteRangeAnswerSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionAnswer = await RangeQuestionAnswer.findOne({
    where: {
      questionId: req.query.rangeQuestionId,
      reviewId: req.query.reviewId,
    },
  });
  if (!questionAnswer) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.QUESTIONANSWER_NOT_FOUND);
    return;
  }
  const review = await questionAnswer.getReview();
  if (!(await review.isReviewer(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not the reviewer of this review");
    return;
  }
  if (review.submitted) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The review is already submitted");
    return;
  }
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    !(
      assignment.isAtState(AssignmentState.FEEDBACK) &&
      moment().isBefore(assignment.reviewEvaluationDueDate)
    )
  ) {
    res.status(HttpStatusCode.FORBIDDEN).send("The reviewevaluation is passed");
    return;
  }
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    !assignment.lateSubmissionReviews &&
    moment().isAfter(assignment.reviewDueDate)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(
        "The due date for submissionReview has passed and late submission reviews are not allowed by the teacher"
      );
    return;
  }
  // start transaction to make sure an asnwer isnt deleted from a submitted review
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // const review
      const reviewToCheck = await transactionalEntityManager.findOneOrFail(
        Review,
        review.id
      );
      if (reviewToCheck.submitted) {
        throw new Error("The review is already submitted");
      }
      await transactionalEntityManager.remove(questionAnswer);
    }
  );
  res.send(questionAnswer);
});

export default router;
