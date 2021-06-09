import express from "express";
import Joi from "@hapi/joi";
import {
  validateBody,
  idSchema,
  validateParams,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import { getManager } from "typeorm";
import ResponseMessage from "../enum/ResponseMessage";
import {
  addDefaultReviewEvaluationQuestions,
  addCopyOfQuestions,
} from "../util/copyReviewQuestions";
import { AssignmentState } from "../enum/AssignmentState";
import _ from "lodash";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import Questionnaire from "../models/Questionnaire";
import AssignmentVersion from "../models/AssignmentVersion";

const router = express.Router();

// get the reviewquestionaire
router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // also loads the questions
  const questionnaire = await ReviewQuestionnaire.findOne(req.params.id);
  if (!questionnaire) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  // students can only access it when the assignment is in review state
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    !(await questionnaire.isTeacherOrTeachingAssistantInCourse(user)) &&
    !(
      (await assignment.isEnrolledInGroup(user)) &&
      assignment.isAtState(AssignmentState.FEEDBACK)
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view this questionnaire");
    return;
  }
  // sort the questions and return questionnaire
  const sortedQuestions = _.sortBy(questionnaire.questions, "number");
  // sort the options alphabetically in case it is a question with options
  for (const question of sortedQuestions) {
    if (question instanceof CheckboxQuestion) {
      if (!(await questionnaire.isTeacherInCourse(user))) {
        question.options.map((option) => {
          delete option.points;
          return option;
        });
      }
      const sortedOptions = _.sortBy(question.options, "text");
      question.options = sortedOptions;
    } else if (question instanceof MultipleChoiceQuestion) {
      if (!(await questionnaire.isTeacherInCourse(user))) {
        question.options.map((option) => {
          delete option.points;
          return option;
        });
      }
      const sortedOptions = _.sortBy(question.options, "text");
      question.options = sortedOptions;
    }
  }
  questionnaire.questions = sortedQuestions;
  res.send(questionnaire);
});

// Joi inputvalidation
const questionnaireSchema = Joi.object({
  assignmentVersionId: Joi.number().integer().required(),
});
// post a questionnaire in an assignment
router.post("/", validateBody(questionnaireSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignmentVersion = await AssignmentVersion.findOne(
    req.body.assignmentVersionId
  );
  if (!assignmentVersion) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignmentVersion.isTeacherInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  const assignment = await assignmentVersion.getAssignment();
  if (!assignment.reviewEvaluation) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("Review evaluation is not enabled");
    return;
  }
  if (await assignmentVersion.getReviewQuestionnaire()) {
    res.status(HttpStatusCode.FORBIDDEN).send("Questionnaire already exists");
    return;
  }
  const questionnaire = new ReviewQuestionnaire();
  // start transaction make sure the questionnaire and assignment are both saved
  // and no questionnaire is made in the mean time
  await getManager().transaction(
    "REPEATABLE READ",
    async (transactionalEntityManager) => {
      // get the assignment with questionnaires
      const assignmentVersion = await transactionalEntityManager.findOneOrFail(
        AssignmentVersion,
        req.body.assignmentVersionId
      );
      // make sure the questionnaire not already exists
      if (assignmentVersion.reviewQuestionnaireId) {
        throw new Error("Questionnaire already exists");
      }
      // save questionnaire
      await questionnaire.validateOrReject();
      await transactionalEntityManager.save(questionnaire);

      // save the assignment with the questionnaire
      assignmentVersion.reviewQuestionnaire = questionnaire;
      // validateOrReject might cause a deadlock
      // await assignmentVersion.validateOrReject();
      await transactionalEntityManager.save(assignmentVersion);
    }
  );
  // reload questionnaire to get all data
  // questionnaire should be defined now (else we would be in the catch)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await questionnaire!.reload();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  res.send(questionnaire!);
});

// Joi inputvalidation
const copyFromQuestionnaireIdSchema = Joi.object({
  copyFromQuestionnaireId: Joi.number().integer().required(),
});
router.patch(
  "/:id/copyquestions",
  validateParams(idSchema),
  validateBody(copyFromQuestionnaireIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const questionnaireId = req.params.id;
    const questionnaire = await ReviewQuestionnaire.findOne(questionnaireId);
    const copyFromQuestionnaireId = req.body.copyFromQuestionnaireId;
    const copyFromQuestionnaire = await Questionnaire.findOne(
      copyFromQuestionnaireId
    );
    if (!questionnaire || !copyFromQuestionnaire) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
    }
    if (questionnaire.id === copyFromQuestionnaire.id) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Two distinct questionnaires are required");
      return;
    }
    if (
      !(await questionnaire.isTeacherInCourse(user)) ||
      !(await copyFromQuestionnaire.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    const assignmentVersion = await questionnaire.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
    if (assignment.isAtOrAfterState(AssignmentState.FEEDBACK)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is already in feedback state");
      return;
    }
    await addCopyOfQuestions(questionnaire, copyFromQuestionnaire.questions);
    await questionnaire.reload();
    res.send(questionnaire);
  }
);

const gradedSchema = Joi.object({
  graded: Joi.boolean().required(),
});

// add default questions to the reviewquestionnaire
router.patch(
  "/:id/defaultquestions",
  validateParams(idSchema),
  validateBody(gradedSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const questionnaireId = req.params.id;
    const questionnaire = await ReviewQuestionnaire.findOne(questionnaireId);
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
    if (assignment.isAtOrAfterState(AssignmentState.FEEDBACK)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is already in feedback state");
      return;
    }
    await addDefaultReviewEvaluationQuestions(questionnaire, req.body.graded);
    await questionnaire.reload();
    res.send(questionnaire);
  }
);

export default router;
