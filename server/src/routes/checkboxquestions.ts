import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import Questionnaire from "../models/Questionnaire";
import CheckboxQuestion from "../models/CheckboxQuestion";

const router = express.Router();

// Joi inputvalidation
const questionSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  questionnaireId: Joi.number().integer().required(),
});
// post a question
router.post("/", validateBody(questionSchema), async (req, res) => {
  const user = req.user!;
  try {
    const questionnaire = await Questionnaire.findOneOrFail(
      req.body.questionnaireId
    );
    if (await questionnaire.isTeacherOfCourse(user)) {
      const question = new CheckboxQuestion(
        req.body.text,
        req.body.number,
        req.body.optional,
        questionnaire
      );
      await question.save();
      res.send(question);
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
  }
});

export default router;
