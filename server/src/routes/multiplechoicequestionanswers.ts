import express from "express";
import Joi from "joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import MultipleChoiceQuestionAnswer from "../models/MultipleChoiceQuestionAnswer";
import MultipleChoiceQuestionOption from "../models/MultipleChoiceQuestionOption";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import moment from "moment";
import { getManager } from "typeorm";

const router = express.Router();

// Joi inputvalidation
const multipleChoiceAnswerSchema = Joi.object({
  multipleChoiceQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
  multipleChoiceQuestionOptionId: Joi.number().integer().required(),
});
// post an multipleChoiceAnswer
// overwrites existing if already exists
router.post("/", validateBody(multipleChoiceAnswerSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const question = await MultipleChoiceQuestion.findOne(
    req.body.multipleChoiceQuestionId
  );
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
  if (!review.isReviewer(user)) {
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
  const questionOption = await MultipleChoiceQuestionOption.findOne(
    req.body.multipleChoiceQuestionOptionId
  );
  if (!questionOption) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.QUESTIONOPTION_NOT_FOUND);
    return;
  }
  if (!question.containsOption(questionOption)) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("The questionOption is not part of this question");
    return;
  }
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
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
  // make or overwrite multipleChoiceAnswer;
  let multipleChoiceAnswer = await MultipleChoiceQuestionAnswer.findOne({
    where: { reviewId: review.id, questionId: question.id },
  });
  if (multipleChoiceAnswer) {
    multipleChoiceAnswer.multipleChoiceAnswer = questionOption;
  } else {
    multipleChoiceAnswer = new MultipleChoiceQuestionAnswer(
      question,
      review,
      questionOption
    );
  }
  await multipleChoiceAnswer.save();
  res.send(multipleChoiceAnswer);
});

// Joi inputvalidation
const deleteMultipleChoiceAnswerSchema = Joi.object({
  multipleChoiceQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
});
// delete an multipleChoiceAnswer
router.delete(
  "/",
  validateQuery(deleteMultipleChoiceAnswerSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let questionAnswer = await MultipleChoiceQuestionAnswer.findOne({
      where: {
        questionId: req.query.multipleChoiceQuestionId,
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
    if (!review.isReviewer(user)) {
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
    const assignmentVersion = await questionnaire.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
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
      "REPEATABLE READ",
      async (transactionalEntityManager) => {
        // review with update lock
        const reviewToCheck = await transactionalEntityManager
          .createQueryBuilder(Review, "review")
          .setLock("pessimistic_write")
          .where("id = :id", { id: review.id })
          .getOne();

        if (!reviewToCheck) {
          throw new Error("Review does not exist");
        }
        if (reviewToCheck.submitted) {
          throw new Error("The review is already submitted");
        }
        questionAnswer = await transactionalEntityManager.findOneOrFail(
          MultipleChoiceQuestionAnswer,
          {
            where: {
              questionId: req.query.multipleChoiceQuestionId,
              reviewId: req.query.reviewId,
            },
          }
        );
        await transactionalEntityManager.remove(questionAnswer);
      }
    );
    res.send(questionAnswer);
  }
);

export default router;
