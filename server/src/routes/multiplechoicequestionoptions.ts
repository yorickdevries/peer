import express from "express";
import Joi from "@hapi/joi";
import {
  validateBody,
  validateParams,
  idSchema,
} from "../middleware/validation";
import optionsRequests from "../util/optionsRequests";

const router = express.Router();

// Joi inputvalidation
const questionOptionSchema = Joi.object({
  text: Joi.string().required(),
  multipleChoiceQuestionId: Joi.number().integer().required(),
  points: Joi.string()
    .trim()
    .regex(/[+-]?([0-9]*[.])?[0-9]+/),
});

// post a question
router.post("/", validateBody(questionOptionSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const { points, multipleChoiceQuestionId, text } = req.body;
  const questionOptionObject = await optionsRequests.postQuestionHandler({
    points,
    id: multipleChoiceQuestionId,
    user,
    text,
    isMultipleChoice: true,
  });
  if (!questionOptionObject.ok) {
    res.status(questionOptionObject.status).send(questionOptionObject.content);
    return;
  }
  await questionOptionObject.content.save();
  res.send(questionOptionObject.content);
});

// patch an option
router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(optionsRequests.questionPatchSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const { points, text } = req.body;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionOptionId: number = req.params.id as any;
    const questionOptionObject = await optionsRequests.patchQuestionHandler({
      points,
      id: questionOptionId,
      user,
      text,
      isMultipleChoice: true,
    });
    if (!questionOptionObject.ok) {
      res
        .status(questionOptionObject.status)
        .send(questionOptionObject.content);
      return;
    }
    await questionOptionObject.content.save();
    res.send(questionOptionObject.content);
  }
);

router.delete("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionOptionId: number = req.params.id as any;
  const questionOptionObject = await optionsRequests.deleteQuestionHandler(
    questionOptionId,
    true,
    user
  );
  if (!questionOptionObject.ok) {
    res.status(questionOptionObject.status).send(questionOptionObject.content);
    return;
  }
  await questionOptionObject.content.remove();
  res.send(questionOptionObject.content);
});

export default router;
