import express from "express";
import Joi from "@hapi/joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import CheckboxQuestion from "../models/CheckboxQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import CheckboxQuestionAnswer from "../models/CheckboxQuestionAnswer";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
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
  let checkboxAnswer: CheckboxQuestionAnswer | undefined;
  // make or overwrite checkboxAnswer;
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      checkboxAnswer = await transactionalEntityManager.findOne(
        CheckboxQuestionAnswer,
        {
          where: {
            reviewId: review.id,
            questionId: question.id,
          },
        }
      );
      if (checkboxAnswer) {
        checkboxAnswer.checkboxAnswer = checkboxQuestionOptions;
      } else {
        checkboxAnswer = new CheckboxQuestionAnswer(
          question,
          review,
          checkboxQuestionOptions
        );
      }
      await transactionalEntityManager.save(checkboxAnswer);
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await checkboxAnswer!.reload();
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
    const questionAnswer = await CheckboxQuestionAnswer.findOne({
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
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The reviewevaluation is passed");
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
