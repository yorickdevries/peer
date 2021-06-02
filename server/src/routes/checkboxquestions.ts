import express from "express";
import Joi from "@hapi/joi";
import {
  validateParams,
  validateBody,
  idSchema,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import Questionnaire from "../models/Questionnaire";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ResponseMessage from "../enum/ResponseMessage";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { AssignmentState } from "../enum/AssignmentState";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import _ from "lodash";
import { getManager } from "typeorm";

const router = express.Router();

// get the checkbox question
router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const question = await CheckboxQuestion.findOne(req.params.id);
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
  if (!(await questionnaire.isTeacherInCourse(user))) {
    question.options.map((option) => {
      delete option.points;
    });
  }
  const sortedOptions = _.sortBy(question.options, "text");
  question.options = sortedOptions;
  res.send(question);
});

// Joi inputvalidation
const questionSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  questionnaireId: Joi.number().integer().required(),
  graded: Joi.boolean().required(),
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
  const question = new CheckboxQuestion(
    req.body.text,
    req.body.number,
    req.body.optional,
    req.body.graded,
    questionnaire
  );
  await question.save();
  res.send(question);
});

// Joi inputvalidation
const questionPatchSchema = Joi.object({
  text: Joi.string().required(),
  number: Joi.number().integer().required(),
  optional: Joi.boolean().required(),
  graded: Joi.boolean().required(),
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
    const question = await CheckboxQuestion.findOne(questionId);
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
    const illegalChanges =
      question.text !== req.body.text &&
      question.number !== req.body.number &&
      question.optional !== req.body.optional;
    if (
      questionnaire instanceof SubmissionQuestionnaire &&
      assignment.isAtOrAfterState(AssignmentState.REVIEW) &&
      illegalChanges
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is already in review state");
      return;
    }
    if (
      questionnaire instanceof ReviewQuestionnaire &&
      assignment.isAtOrAfterState(AssignmentState.FEEDBACK) &&
      illegalChanges
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is already in feedback state");
      return;
    }
    // graded changed
    const gradedChanged = question.graded !== req.body.graded;
    if (!gradedChanged) {
      // if grades isn't changed, we can just update the question
      question.text = req.body.text;
      question.number = req.body.number;
      question.optional = req.body.optional;
      question.graded = req.body.graded;
      await question.save();
    } else {
      await getManager().transaction(
        "SERIALIZABLE", // make sure no new options can be added in the mean time
        async (transactionalEntityManager) => {
          // reload the question in transaction
          const reloadedQuestion = await transactionalEntityManager.findOneOrFail(
            CheckboxQuestion,
            questionId
          );
          const reloadedQuestionOptions = await transactionalEntityManager.find(
            CheckboxQuestionOption,
            { where: { question: reloadedQuestion } }
          );
          // update question
          reloadedQuestion.text = req.body.text;
          reloadedQuestion.number = req.body.number;
          reloadedQuestion.optional = req.body.optional;
          reloadedQuestion.graded = req.body.graded;
          // make sure all points are valid and save the updated version
          for (const reloadedQuestionOption of reloadedQuestionOptions) {
            reloadedQuestionOption.points = reloadedQuestion.graded ? 0 : null;
            await transactionalEntityManager.save(reloadedQuestionOption);
          }
          // lastly update the question itself (including graded value)
          await transactionalEntityManager.save(reloadedQuestion);
        }
      );
    }
    await question.reload();
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
  const question = await CheckboxQuestion.findOne(questionId);
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
  if (question.options.length > 0) {
    res.status(HttpStatusCode.FORBIDDEN).send("The question still has options");
    return;
  }
  // otherwise update the question
  await question.remove();
  res.send(question);
});

export default router;
