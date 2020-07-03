import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import RangeQuestion from "../models/RangeQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import AssignmentState from "../enum/AssignmentState";
import RangeQuestionAnswer from "../models/RangeQuestionAnswer";

const router = express.Router();

// Joi inputvalidation
const answerSchema = Joi.object({
  rangeQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
  answer: Joi.number().integer().required(),
});
// post an answer
// overwrites existing if already exists
router.post("/", validateBody(answerSchema), async (req, res) => {
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
  const questionnaire = await review.getQuestionnaire();
  if (!questionnaire.containsQuestion(question)) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("The question is not part of this review");
    return;
  }
  const assignment = await questionnaire.getAssignment();
  if (assignment.getState() !== AssignmentState.REVIEW) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is not in reviewstate");
    return;
  }
  // make or overwrite answer;
  let answer = await RangeQuestionAnswer.findOne({
    where: {
      reviewId: review.id,
      questionId: question.id,
    },
  });
  if (answer) {
    answer.answer = req.body.answer;
  } else {
    answer = new RangeQuestionAnswer(question, review, req.body.answer);
  }
  await answer.save();
  res.send(answer);
});

export default router;
