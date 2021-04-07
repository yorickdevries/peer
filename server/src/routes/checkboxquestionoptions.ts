import express from "express";
import Joi from "@hapi/joi";
import {
  validateBody,
  validateParams,
  idSchema,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ResponseMessage from "../enum/ResponseMessage";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { AssignmentState } from "../enum/AssignmentState";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";

const router = express.Router();

// Joi inputvalidation
const questionOptionSchema = Joi.object({
  text: Joi.string().required(),
  checkboxQuestionId: Joi.number().integer().required(),
  points: Joi.string()
    .trim()
    .regex(/[+-]?([0-9]*[.])?[0-9]+/),
});
// post a questionoption
router.post("/", validateBody(questionOptionSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  if (question.graded && req.body.points === undefined) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.NON_GRADED_OPTION_FOR_QUESTION_GRADED);
    return;
  }
  if (!question.graded && req.body.points !== undefined) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.GRADED_OPTION_FOR_NON_QUESTION_GRADED);
    return;
  }
  const questionnaire = await question.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
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
  const questionOption = new CheckboxQuestionOption(
    req.body.text,
    question,
    Number(req.body.points)
  );
  await questionOption.save();
  res.send(questionOption);
});

// Joi inputvalidation
const questionPatchSchema = Joi.object({
  text: Joi.string().required(),
  points: Joi.string()
    .trim()
    .regex(/[+-]?([0-9]*[.])?[0-9]+/),
});
// patch a questionoption
router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(questionPatchSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionOptionId: number = req.params.id as any;
    const questionOption = await CheckboxQuestionOption.findOne(
      questionOptionId
    );
    if (!questionOption) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.QUESTIONOPTION_NOT_FOUND);
      return;
    }
    const question = await questionOption.getQuestion();
    if (!(await question.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    const questionnaire = await question.getQuestionnaire();
    const assignmentVersion = await questionnaire.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
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
    questionOption.text = req.body.text;
    if (req.body.points) {
      questionOption.points = Number(req.body.points);
    }
    await questionOption.save();
    res.send(questionOption);
  }
);

router.delete("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionOptionId: number = req.params.id as any;
  const questionOption = await CheckboxQuestionOption.findOne(questionOptionId);
  if (!questionOption) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.QUESTIONOPTION_NOT_FOUND);
    return;
  }
  const question = await questionOption.getQuestion();
  if (!(await question.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  const questionnaire = await question.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
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
  await questionOption.remove();
  res.send(questionOption);
});

export default router;
