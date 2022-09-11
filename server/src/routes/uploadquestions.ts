import express from "express";
import Joi from "@hapi/joi";
import {idSchema, validateBody, validateParams,} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import Questionnaire from "../models/Questionnaire";
import UploadQuestion from "../models/UploadQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import {AssignmentState} from "../enum/AssignmentState";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import Extensions from "../enum/Extensions";
import QuestionOperation from "../enum/QuestionOperation";

const router = express.Router();

// get the upload question
router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const question = await UploadQuestion.findOne(req.params.id);
  if (!question) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  // students can only access it when the assignment is in review state
  const questionnaire = await question.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    !(await questionnaire.isTeacherInCourse(user)) &&
    !(
      (await assignment.isEnrolledInGroup(user)) &&
      assignment.isAtOrAfterState(AssignmentState.REVIEW)
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view this question");
    return;
  }
  res.send(question);
});

// Joi inputvalidation
const questionSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  questionnaireId: Joi.number().integer().required(),
  extensions: Joi.string()
    .valid(...Object.values(Extensions))
    .required(),
});
// post a question
router.post("/", validateBody(questionSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    return;
  }
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
  const question = new UploadQuestion(
    req.body.text,
    req.body.number,
    req.body.optional,
    questionnaire,
    req.body.extensions
  );
  await question.saveAndOrder(QuestionOperation.CREATE);
  res.send(question);
});

// Joi inputvalidation
const questionPatchSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  extensions: Joi.string()
    .valid(...Object.values(Extensions))
    .required(),
});
// patch a question
router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(questionPatchSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionId: number = req.params.id as any;
    const question = await UploadQuestion.findOne(questionId);
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
    // otherwise update the question
    question.text = req.body.text;
    question.number = req.body.number;
    question.optional = req.body.optional;
    question.extensions = req.body.extensions;
    await question.saveAndOrder(QuestionOperation.MODIFY);
    res.send(question);
  }
);

// delete a question
router.delete("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionId: number = req.params.id as any;
  const question = await UploadQuestion.findOne(questionId);
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
  // otherwise update the question
  await question.saveAndOrder(QuestionOperation.DELETE);
  res.send(question);
});

export default router;
