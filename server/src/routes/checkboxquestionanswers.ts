import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import CheckboxQuestion from "../models/CheckboxQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import CheckboxQuestionAnswer from "../models/CheckboxQuestionAnswer";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import moment from "moment";

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

export default router;
