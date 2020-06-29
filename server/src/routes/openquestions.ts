import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import Questionnaire from "../models/Questionnaire";
import OpenQuestion from "../models/OpenQuestion";

const router = express.Router();

// Joi inputvalidation
const openQuestionSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  questionnaireId: Joi.number().integer().required(),
});
// post a submissionQuestionnaire in an assignment
router.post("/", validateBody(openQuestionSchema), async (req, res) => {
  const user = req.user!;
  try {
    const questionnaire = await Questionnaire.findOneOrFail(
      req.body.questionnaireId
    );
    if (await questionnaire.isTeacherOfCourse(user)) {
      const openQuestion = new OpenQuestion(
        req.body.text,
        req.body.number,
        req.body.optional,
        questionnaire
      );
      await openQuestion.save();
      res.send(openQuestion);
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
