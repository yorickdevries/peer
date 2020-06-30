import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";

const router = express.Router();

// Joi inputvalidation
const questionOptionSchema = Joi.object({
  text: Joi.string().required(),
  checkboxQuestionId: Joi.number().integer().required(),
});
// post a question
router.post("/", validateBody(questionOptionSchema), async (req, res) => {
  const user = req.user!;
  try {
    const question = await CheckboxQuestion.findOneOrFail(
      req.body.checkboxQuestionId
    );
    if (await question.isTeacherOfCourse(user)) {
      const questionOption = new CheckboxQuestionOption(
        req.body.text,
        question
      );
      await questionOption.save();
      res.send(questionOption);
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
