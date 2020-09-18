import express from "express";
import Joi from "@hapi/joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import OpenQuestion from "../models/OpenQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import OpenQuestionAnswer from "../models/OpenQuestionAnswer";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import moment from "moment";
import { getManager } from "typeorm";

const router = express.Router();

// Joi inputvalidation
const openAnswerSchema = Joi.object({
  openQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
  openAnswer: Joi.string().required(),
});
// post an openAnswer
// overwrites existing if already exists
router.post("/", validateBody(openAnswerSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const question = await OpenQuestion.findOne(req.body.openQuestionId);
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
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    !assignment.lateReviewEvaluations &&
    moment().isAfter(assignment.reviewEvaluationDueDate)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(
        "The due date for review evaluation has passed and late review evaluations are not allowed by the teacher"
      );
    return;
  }
  let openAnswer: OpenQuestionAnswer | undefined;
  // make or overwrite openAnswer;
  await getManager().transaction(
    process.env.NODE_ENV === "test" ? "SERIALIZABLE" : "REPEATABLE READ",
    async (transactionalEntityManager) => {
      openAnswer = await transactionalEntityManager.findOne(
        OpenQuestionAnswer,
        {
          where: {
            reviewId: review.id,
            questionId: question.id,
          },
        }
      );
      if (openAnswer) {
        openAnswer.openAnswer = req.body.openAnswer;
      } else {
        openAnswer = new OpenQuestionAnswer(
          question,
          review,
          req.body.openAnswer
        );
      }
      await transactionalEntityManager.save(openAnswer);
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await openAnswer!.reload();
  res.send(openAnswer);
});

// Joi inputvalidation
const deleteOpenAnswerSchema = Joi.object({
  openQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
});
// delete an openAnswer
router.delete("/", validateQuery(deleteOpenAnswerSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionAnswer = await OpenQuestionAnswer.findOne({
    where: {
      questionId: req.query.openQuestionId,
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
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    !assignment.lateReviewEvaluations &&
    moment().isAfter(assignment.reviewEvaluationDueDate)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(
        "The due date for review evaluation has passed and late review evaluations are not allowed by the teacher"
      );
    return;
  }
  // start transaction to make sure an asnwer isnt deleted from a submitted review
  await getManager().transaction(
    process.env.NODE_ENV === "test" ? "SERIALIZABLE" : "REPEATABLE READ",
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
