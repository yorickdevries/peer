import express from "express";
import Joi from "joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import CheckboxQuestion from "../models/CheckboxQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import CheckboxQuestionAnswer from "../models/CheckboxQuestionAnswer";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import moment from "moment";
import { getManager } from "typeorm";

const router = express.Router();

// Joi inputvalidation
const checkboxAnswerSchema = Joi.object({
  checkboxQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
  checkboxQuestionOptionIds: Joi.array()
    .items(Joi.number().integer())
    .required(),
});
// post an checkboxAnswer
// overwrites existing if already exists
router.post("/", validateBody(checkboxAnswerSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const question = await CheckboxQuestion.findOne(req.body.checkboxQuestionId);
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
  const checkboxQuestionOptions: CheckboxQuestionOption[] = [];
  for (const checkboxQuestionOptionId of req.body.checkboxQuestionOptionIds) {
    const questionOption = await CheckboxQuestionOption.findOne(
      checkboxQuestionOptionId
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
    checkboxQuestionOptions.push(questionOption);
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
  // make or overwrite checkboxAnswer;
  let checkboxAnswer = await CheckboxQuestionAnswer.findOne({
    where: {
      reviewId: review.id,
      questionId: question.id,
    },
  });
  if (checkboxAnswer) {
    checkboxAnswer.checkboxAnswer = checkboxQuestionOptions;
  } else {
    checkboxAnswer = new CheckboxQuestionAnswer(
      question,
      review,
      checkboxQuestionOptions
    );
  }
  await checkboxAnswer.save();
  res.send(checkboxAnswer);
});

// Joi inputvalidation
const deleteCheckboxAnswerSchema = Joi.object({
  checkboxQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
});
// delete an checkboxAnswer
router.delete(
  "/",
  validateQuery(deleteCheckboxAnswerSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let questionAnswer = await CheckboxQuestionAnswer.findOne({
      where: {
        questionId: req.query.checkboxQuestionId,
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
          CheckboxQuestionAnswer,
          {
            where: {
              questionId: req.query.checkboxQuestionId,
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
