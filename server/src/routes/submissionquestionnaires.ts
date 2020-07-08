import express from "express";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import {
  validateBody,
  validateParams,
  idSchema,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { getManager } from "typeorm";
import ResponseMessage from "../enum/ResponseMessage";
import _ from "lodash";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import { AssignmentState } from "../enum/AssignmentState";
import Questionnaire from "../models/Questionnaire";
import { addCopyOfQuestions } from "../util/CopyReviewQuestions";

const router = express.Router();

// get the submissionquestionaire for an assignment
router.get("/:id", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  // also loads the questions
  const submissionQuestionnaire = await SubmissionQuestionnaire.findOne(
    req.params.id
  );
  if (!submissionQuestionnaire) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  // students can only access it when the assignment is in review state
  const assignment = await submissionQuestionnaire.getAssignment();
  const assignmentState = assignment.getState();
  if (
    !(await submissionQuestionnaire.isTeacherInCourse(user)) &&
    !(
      (await submissionQuestionnaire.hasReviewsWhereUserIsReviewer(user)) &&
      (assignmentState === AssignmentState.REVIEW ||
        assignmentState === AssignmentState.FEEDBACK)
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view this questionnaire");
    return;
  }
  // sort the questions and return questionnaire
  const sortedQuestions = _.sortBy(submissionQuestionnaire.questions, "number");
  // sort the options alphabetically in case it is a question with options
  for (const question of sortedQuestions) {
    if (question instanceof CheckboxQuestion) {
      const sortedOptions = _.sortBy(question.options, "text");
      question.options = sortedOptions;
    } else if (question instanceof MultipleChoiceQuestion) {
      const sortedOptions = _.sortBy(question.options, "text");
      question.options = sortedOptions;
    }
  }
  submissionQuestionnaire.questions = sortedQuestions;
  res.send(submissionQuestionnaire);
});

// get the reviews a user needs to make by questionnaire id
router.get("/:id/reviews", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  // also loads the questions
  const submissionQuestionnaire = await SubmissionQuestionnaire.findOne(
    req.params.id
  );
  if (!submissionQuestionnaire) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  const assignment = await submissionQuestionnaire.getAssignment();
  const assignmentState = assignment.getState();
  if (
    !(
      assignmentState === AssignmentState.REVIEW ||
      assignmentState === AssignmentState.FEEDBACK
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view reviews");
    return;
  }
  const reviews = await submissionQuestionnaire.getReviewsWhereUserIsReviewer(
    user
  );
  const anonymousReviews = _.map(reviews, (review) => {
    return review.getAnonymousVersion();
  });
  const sortedReviews = _.sortBy(anonymousReviews, "id");
  res.send(sortedReviews);
});

// Joi inputvalidation
const questionnaireSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// post a submissionQuestionnaire in an assignment
router.post("/", validateBody(questionnaireSchema), async (req, res) => {
  const user = req.user!;
  const assignment = await Assignment.findOne(req.body.assignmentId);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignment.isTeacherInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  if (await assignment.getSubmissionQuestionnaire()) {
    res.status(HttpStatusCode.FORBIDDEN).send("Questionnaire already exists");
    return;
  }
  const submissionQuestionnaire = new SubmissionQuestionnaire();
  // start transaction make sure the questionnaire and assignment are both saved
  // and no questionnaire is made in the mean time
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // get the assignment with questionnaires
      const assignment = await transactionalEntityManager.findOneOrFail(
        Assignment,
        req.body.assignmentId
      );
      // make sure the questionnaire not already exists
      if (assignment.submissionQuestionnaireId) {
        throw new Error("Questionnaire already exists");
      }
      // save questionnaire
      await transactionalEntityManager.save(submissionQuestionnaire);

      // save the assignment with the questionnaire
      assignment.submissionQuestionnaire = submissionQuestionnaire;
      await transactionalEntityManager.save(assignment);
    }
  );
  // reload questionnaire to get all data
  // submissionQuestionnaire should be defined now (else we would be in the catch)
  await submissionQuestionnaire!.reload();
  res.send(submissionQuestionnaire!);
});

// add default questions to the reviewquestionnaire
// Joi inputvalidation
const copyFromQuestionnaireIdSchema = Joi.object({
  copyFromQuestionnaireId: Joi.number().integer().required(),
});
router.patch(
  "/:id/copyquestions",
  validateParams(idSchema),
  validateBody(copyFromQuestionnaireIdSchema),
  async (req, res) => {
    const user = req.user!;
    const questionnaireId = req.params.id;
    const questionnaire = await SubmissionQuestionnaire.findOne(
      questionnaireId
    );
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
    const assignment = await questionnaire.getAssignment();
    if (assignment.isAtOrAfterState(AssignmentState.WAITING_FOR_REVIEW)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is already in review state");
      return;
    }
    await addCopyOfQuestions(questionnaire, copyFromQuestionnaire.questions);
    await questionnaire.reload();
    res.send(questionnaire);
  }
);

export default router;
