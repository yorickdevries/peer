import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import OpenQuestion from "../models/OpenQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import AssignmentState from "../enum/AssignmentState";
import OpenQuestionAnswer from "../models/OpenQuestionAnswer";

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
  // make or overwrite openAnswer;
  let openAnswer = await OpenQuestionAnswer.findOne({
    where: {
      reviewId: review.id,
      questionId: question.id,
    },
  });
  if (openAnswer) {
    openAnswer.openAnswer = req.body.openAnswer;
  } else {
    openAnswer = new OpenQuestionAnswer(question, review, req.body.openAnswer);
  }
  await openAnswer.save();
  res.send(openAnswer);
});

export default router;
