import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";

const router = express.Router();

interface Pref {
  name: string;
  desc: string;
  explanation: string;
}

interface SentPref {
  name: string;
  value: string;
}

const Preferences: Pref[] = [
  {
    name: "stRemStageNotSubmitted",
    desc: "Enable Deadline Warning Emails",
    explanation:
      "Sends reminder emails one day before a deadline if a submission/review/evaluation has not been submitted.",
  },
  {
    name: "stRemLateSubmission",
    desc: "Enable Late Review/Evaluation Emails",
    explanation:
      "Sends an email whenever someone submits a review/evaluation after the deadline for your submission",
  },
];

const allPreferenceNames = Preferences.map((p) => p.name);

const postSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      name: Joi.string()
        .valid(...allPreferenceNames)
        .required(),
      value: Joi.boolean().required(),
    })
  ),
});

router.get("/", async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;

  res.send({
    base: Preferences,
    user: user.preferences,
  });
});

router.post("/", validateBody(postSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const preferences = req.body.items;

  preferences.forEach((p: SentPref) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    user.preferences[p.name] = p.value;
  });

  await user.preferences.save();
  res.status(200).send();
});

export default router;
