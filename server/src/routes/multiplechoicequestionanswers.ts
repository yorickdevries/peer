import express from "express";
import Joi from "@hapi/joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import MultipleChoiceQuestionAnswer from "../models/MultipleChoiceQuestionAnswer";
import MultipleChoiceQuestionOption from "../models/MultipleChoiceQuestionOption";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
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
  const assignment = await questionnaire.getAssignment();
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    !assignment.isAtState(AssignmentState.REVIEW)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is not in reviewstate");
    return;
  }
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
  // make or overwrite multipleChoiceAnswer;
  let multipleChoiceAnswer = await MultipleChoiceQuestionAnswer.findOne({
    where: {
      reviewId: review.id,
      questionId: question.id,
    },
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
    const questionAnswer = await MultipleChoiceQuestionAnswer.findOne({
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
  }
);

export default router;
