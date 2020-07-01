import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

// Joi inputvalidation
const questionOptionSchema = Joi.object({
  text: Joi.string().required(),
  checkboxQuestionId: Joi.number().integer().required(),
});
// post a question
router.post("/", validateBody(questionOptionSchema), async (req, res) => {
  const user = req.user!;
  const question = await CheckboxQuestion.findOne(req.body.checkboxQuestionId);
  if (!question) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.QUESTION_NOT_FOUND);
    return;
  }
  if (!(await question.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  const questionOption = new CheckboxQuestionOption(req.body.text, question);
  await questionOption.save();
  res.send(questionOption);
});

export default router;
