import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import RangeQuestion from "../models/RangeQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import RangeQuestionAnswer from "../models/RangeQuestionAnswer";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import moment from "moment";

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
      .send("The reivew is already submitted");
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
  // make or overwrite rangeAnswer;
  let rangeAnswer = await RangeQuestionAnswer.findOne({
    where: {
      reviewId: review.id,
      questionId: question.id,
    },
  });
  if (rangeAnswer) {
    rangeAnswer.rangeAnswer = req.body.rangeAnswer;
  } else {
    rangeAnswer = new RangeQuestionAnswer(
      question,
      review,
      req.body.rangeAnswer
    );
  }
  await rangeAnswer.save();
  res.send(rangeAnswer);
});

export default router;
