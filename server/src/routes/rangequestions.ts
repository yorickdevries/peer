import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import Questionnaire from "../models/Questionnaire";
import RangeQuestion from "../models/RangeQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { AssignmentState } from "../enum/AssignmentState";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";

const router = express.Router();

// Joi inputvalidation
const questionSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  questionnaireId: Joi.number().integer().required(),
  range: Joi.number().integer().required(),
});
// post a question
router.post("/", validateBody(questionSchema), async (req, res) => {
  const user = req.user!;
  const questionnaire = await Questionnaire.findOne(req.body.questionnaireId);
  if (!questionnaire) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
    return;
  }
  if (!(await questionnaire.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
  }
  const assignment = await questionnaire.getAssignment();
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is already in review state");
    return;
  }
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.FEEDBACK)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is already in feedback state");
    return;
  }
  const question = new RangeQuestion(
    req.body.text,
    req.body.number,
    req.body.optional,
    questionnaire,
    req.body.range
  );
  await question.save();
  res.send(question);
});

export default router;
