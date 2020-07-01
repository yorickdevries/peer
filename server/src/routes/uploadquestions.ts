import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import Questionnaire from "../models/Questionnaire";
import UploadQuestion from "../models/UploadQuestion";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

// Joi inputvalidation
const questionSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  questionnaireId: Joi.number().integer().required(),
  extensions: Joi.string().required(),
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
  const question = new UploadQuestion(
    req.body.text,
    req.body.number,
    req.body.optional,
    questionnaire,
    req.body.extensions
  );
  await question.save();
  res.send(question);
});

export default router;
