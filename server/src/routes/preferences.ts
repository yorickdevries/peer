import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import Preferences from "../enum/Preferences";

const router = express.Router();

const postSchema = Joi.object({
  name: Joi.string()
    .valid(...Object.values(Preferences))
    .required(),
  value: Joi.boolean().required(),
});

router.get("/", async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;

  res.send(user.preferences);
});

router.post("/", validateBody(postSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user.preferences[req.body.name] = req.body.value;
  await user.preferences.save();
  res.status(200).send();
});

export default router;
