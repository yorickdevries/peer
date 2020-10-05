import express from "express";
import Joi from "@hapi/joi";
import {
  validateQuery,
  validateParams,
  idSchema,
  validateBody,
} from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import _ from "lodash";
import { AssignmentState } from "../enum/AssignmentState";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import { getManager } from "typeorm";
import moment from "moment";
import ReviewOfReview from "../models/ReviewOfReview";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import AssignmentExport from "../models/AssignmentExport";
import {
  startDistributeReviewsForAssignmentWorker,
  startOpenFeedbackForAssignmentWorker,
  startExportGradesForAssignmentVersionWorker,
  startExportReviewsForAssignmentVersionWorker,
} from "../workers/pool";
import submitReview from "../util/submitReview";
import AssignmentVersion from "../models/AssignmentVersion";

const router = express.Router();

// Joi inputvalidation for query
const assignmentSubmitIdSchema = Joi.object({
  assignmentVersionId: Joi.number().integer().required(),
  submitted: Joi.boolean(),
});
// get all the reviews for an assignment
router.get("/", validateQuery(assignmentSubmitIdSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentVersionId: number = req.query.assignmentVersionId as any;
  const assignmentVersion = await AssignmentVersion.findOne(
    assignmentVersionId
  );
  if (!assignmentVersion) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignmentVersion.isTeacherOrTeachingAssistantInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
    return;
  }
  const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
  if (!questionnaire) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
    return;
  }
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitted: boolean | undefined = req.query.submitted as any;
  const reviews = await questionnaire.getReviews(submitted);
  const sortedReviews = _.sortBy(reviews, "id");
  res.send(sortedReviews);
});

// Joi inputvalidation for query
const assignmentExportIdSchema = Joi.object({
  assignmentVersionId: Joi.number().integer().required(),
  exportType: Joi.string().valid("csv", "xls"),
});
router.post(
  "/exportgrades",
  validateQuery(assignmentExportIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentVersionId: number = req.query.assignmentVersionId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportType: "csv" | "xls" = req.query.exportType as any;
    const assignmentVersion = await AssignmentVersion.findOne(
      assignmentVersionId
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
    const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
    if (!questionnaire) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
    }
    const submitted = true;
    const reviews = await questionnaire.getReviews(submitted);
    // make sure there is something to export
    if (reviews.length == 0) {
      res.status(HttpStatusCode.BAD_REQUEST);
      res.send("Nothing to export.");
      return;
    }
    const assignment = await assignmentVersion.getAssignment();
    const assignmentExport = new AssignmentExport(user, assignment, null);
    await assignmentExport.save();

    // offload a function to a worker
    startExportGradesForAssignmentVersionWorker(
      assignmentVersion.id,
      assignmentExport.id,
      exportType
    );

    // send message that grades are being exported
    res.send(assignmentExport);
  }
);

router.post(
  "/exportreviews",
  validateQuery(assignmentExportIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentVersionId: number = req.query.assignmentVersionId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportType: "csv" | "xls" = req.query.exportType as any;
    const assignmentVersion = await AssignmentVersion.findOne(
      assignmentVersionId
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
    const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
    if (!questionnaire) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
    }
    // make sure there is something to export
    const reviews = await questionnaire.getReviews();
    if (reviews.length == 0) {
      res.status(HttpStatusCode.BAD_REQUEST);
      res.send("Nothing to export.");
      return;
    }
    // make export entry without file
    const assignment = await assignmentVersion.getAssignment();
    const assignmentExport = new AssignmentExport(user, assignment, null);
    await assignmentExport.save();

    // offload a function to a worker
    startExportReviewsForAssignmentVersionWorker(
      assignmentVersion.id,
      assignmentExport.id,
      exportType
    );

    // send message that reviews are being exported
    res.send(assignmentExport);
  }
);

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
router.patch(
  "/openfeedback",
  validateQuery(assignmentIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentId: number = req.query.assignmentId as any;
    const assignment = await Assignment.findOne(assignmentId);
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
    // get assignmentstate
    if (!assignment.isAtState(AssignmentState.REVIEW)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in review state");
      return;
    }
    // check whether review evaluation is enabled and questionnaire is present
    if (assignment.reviewEvaluation) {
      for (const assignmentVersion of assignment.versions) {
        if (!assignmentVersion.reviewQuestionnaireId) {
          res
            .status(HttpStatusCode.FORBIDDEN)
            .send("No reviewQuestionnaire is present to evaluate the reviews");
          return;
        }
      }
    }
    for (const assignmentVersion of assignment.versions) {
      const reviewQuestionnaire = await assignmentVersion.getReviewQuestionnaire();
      if (reviewQuestionnaire) {
        if (reviewQuestionnaire.questions.length === 0) {
          res
            .status(HttpStatusCode.FORBIDDEN)
            .send("The questionnaire doesn't have questions");
          return;
        }
        // check whether there is a question without option:
        for (const question of reviewQuestionnaire.questions) {
          if (
            question instanceof CheckboxQuestion ||
            question instanceof MultipleChoiceQuestion
          ) {
            if (question.options.length === 0) {
              res
                .status(HttpStatusCode.FORBIDDEN)
                .send(
                  "One of the questions in the questionnaire doesn't have options"
                );
              return;
            }
          }
        }
      }
    }
    // offload a function to a worker
    startOpenFeedbackForAssignmentWorker(assignmentId);

    // send message that reviews are being submitted
    res.send();
  }
);

// get a review eitehr as teacher or student
router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (await review.isTeacherOrTeachingAssistantInCourse(user)) {
    res.send(review);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  const anonymousReview = review.getAnonymousVersion();
  // reviewer should access the review when reviewing
  if (
    review.isReviewer(user) &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    // set startedAt if not defined yet
    if (!review.startedAt) {
      review.startedAt = new Date();
      await review.save();
    }
    res.send(anonymousReview);
    return;
  }
  // reviewed user should access the review when getting feedback and the review is finished
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    res.send(anonymousReview);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
  return;
});

// get a review answers eitehr as teacher or student
router.get("/:id/answers", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  const reviewAnswers = await review.getQuestionAnswers();
  const sortedReviewAnswers = _.sortBy(reviewAnswers, "questionId");
  if (await review.isTeacherOrTeachingAssistantInCourse(user)) {
    res.send(sortedReviewAnswers);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    // reviewer should access the review when reviewing
    (review.isReviewer(user) &&
      assignment.isAtOrAfterState(AssignmentState.REVIEW)) ||
    // reviewed user should access the review when getting feedback and the review is finished
    ((await review.isReviewed(user)) &&
      assignment.isAtState(AssignmentState.FEEDBACK) &&
      review.submitted)
  ) {
    res.send(sortedReviewAnswers);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
});

// get a review file either as teacher or student
router.get("/:id/filemetadata", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const submission = review.submission!;
  const file = submission.file;
  if (await review.isTeacherOrTeachingAssistantInCourse(user)) {
    res.send(file);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    review.isReviewer(user) &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    // replace the filename with "File" before sending
    file.name = file.getAnonymousFileName();
    res.send(file);
    return;
  }
  // reviewed user should access the review when getting feedback and the review is finished
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    res.send(file);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
  return;
});

// get a review file either as teacher or student
router.get("/:id/file", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const submission = review.submission!;
  const file = submission.file;
  const filePath = file.getPath();
  if (await review.isTeacherOrTeachingAssistantInCourse(user)) {
    const fileName = file.getFileNamewithExtension();
    res.download(filePath, fileName);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    review.isReviewer(user) &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    // set downloadedAt if not defined yet
    if (!review.downloadedAt) {
      review.downloadedAt = new Date();
      await review.save();
    }
    const fileName = file.getAnonymousFileNamewithExtension();
    res.download(filePath, fileName);
    return;
  }
  // reviewed user should access the review when getting feedback and the review is finished
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    const fileName = file.getFileNamewithExtension();
    res.download(filePath, fileName);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
  return;
});

// Joi inputvalidation for query
const reviewSchema = Joi.object({
  submitted: Joi.boolean().required(),
  flaggedByReviewer: Joi.boolean().required(),
});
// change a review
router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(reviewSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const review = await ReviewOfSubmission.findOne(req.params.id);
    if (!review) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send(ResponseMessage.REVIEW_NOT_FOUND);
      return;
    }
    if (!review.isReviewer(user)) {
      res.status(HttpStatusCode.FORBIDDEN).send("You are not the reviewer");
      return;
    }
    // get assignmentstate
    const questionnaire = await review.getQuestionnaire();
    const assignmentVersion = await questionnaire.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
    if (
      !assignment.lateSubmissionReviews &&
      moment().isAfter(assignment.reviewDueDate)
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "The due date for submissionReview has passed and late submission reviews are not allowed by the teacher"
        );
      return;
    }
    // Review cannot be changed (unsubmitted/flagged) in feedback phase when submitted
    if (assignment.isAtState(AssignmentState.FEEDBACK) && review.submitted) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in review state");
      return;
    }
    const submitted = req.body.submitted;
    const flaggedByReviewer = req.body.flaggedByReviewer;
    // set new values
    if (submitted) {
      // submit review in transaction
      await submitReview(review, flaggedByReviewer);
      await review.reload();
    } else {
      // just set the fields
      review.flaggedByReviewer = flaggedByReviewer;
      review.submitted = false;
      review.submittedAt = null;
      await review.save();
    }
    const anonymousReview = review.getAnonymousVersion();
    res.send(anonymousReview);
    return;
  }
);

// Joi inputvalidation for query
const reviewApprovalSchema = Joi.object({
  approvalByTA: Joi.boolean().required(),
});
// change a review approval
router.patch(
  "/:id/approval",
  validateParams(idSchema),
  validateBody(reviewApprovalSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const review = await ReviewOfSubmission.findOne(req.params.id);
    if (!review) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send(ResponseMessage.REVIEW_NOT_FOUND);
      return;
    }
    if (!(await review.isTeacherOrTeachingAssistantInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
      return;
    }
    if (!review.submitted) {
      res.status(HttpStatusCode.FORBIDDEN).send("The review isn't submitted");
      return;
    }
    // get assignmentstate
    const questionnaire = await review.getQuestionnaire();
    const assignmentVersion = await questionnaire.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
    if (!assignment.isAtState(AssignmentState.FEEDBACK)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in feedback state");
      return;
    }
    if (
      review.approvingTA !== null &&
      review.approvingTA.netid !== user.netid
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The review has already been evaluated by another TA");
      return;
    }
    // set new values
    review.approvalByTA = req.body.approvalByTA;
    review.approvingTA = user;
    await review.save();
    res.send(review);
    return;
  }
);

// get an evaluation as student
router.get("/:id/evaluation", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  // get assignmentstate
  const submissionQuestionnaire = await review.getQuestionnaire();
  const assignmentVersion = await submissionQuestionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  const reviewEvaluation = await ReviewOfReview.findOne({
    where: { reviewOfSubmission: review.id },
  });
  if (!reviewEvaluation) {
    res.status(HttpStatusCode.NOT_FOUND).send("Evaluation is not found");
    return;
  }
  if (await review.isTeacherOrTeachingAssistantInCourse(user)) {
    res.send(reviewEvaluation.getAnonymousVersionWithReviewerNetid());
    return;
  }
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    res.send(reviewEvaluation.getAnonymousVersionWithReviewerNetid());
    return;
  }
  if ((await reviewEvaluation.isReviewed(user)) && reviewEvaluation.submitted) {
    res.send(reviewEvaluation.getAnonymousVersion());
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to evaluate this review");
  return;
});

// make an evaluation as student
router.post("/:id/evaluation", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  // get assignmentstate
  const submissionQuestionnaire = await review.getQuestionnaire();
  const assignmentVersion = await submissionQuestionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    !(
      (await review.isReviewed(user)) &&
      !(
        assignment.blockFeedback &&
        (await submissionQuestionnaire.hasUnsubmittedReviewsWhereUserIsReviewer(
          user
        ))
      ) &&
      assignment.isAtState(AssignmentState.FEEDBACK) &&
      review.submitted &&
      assignment.reviewEvaluation &&
      (assignment.lateReviewEvaluations ||
        !moment().isAfter(assignment.reviewEvaluationDueDate))
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to evaluate this review");
    return;
  }
  const reviewQuestionnaire = await assignmentVersion.getReviewQuestionnaire();
  if (!reviewQuestionnaire) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
    return;
  }
  const existingReview = await ReviewOfReview.findOne({
    where: { reviewOfSubmission: review.id },
  });
  if (existingReview) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("There already exists a reviewEvaluation");
    return;
  }

  // create the reviewEvaluation
  const reviewEvaluation = new ReviewOfReview(
    reviewQuestionnaire,
    user,
    false,
    false,
    new Date(), // set startedAt
    null,
    null,
    null,
    null,
    review
  );
  // validate outside transaction as it otherwise might block the transaction
  await reviewEvaluation.validateOrReject();
  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way double reviewevaluations can be prevented
    async (transactionalEntityManager) => {
      // check whether the review is already evaluated
      const existingReview = await transactionalEntityManager.findOne(
        ReviewOfReview,
        { where: { reviewOfSubmission: review.id } }
      );
      if (existingReview) {
        throw new Error("There already exists a reviewEvaluation");
      }
      await transactionalEntityManager.save(reviewEvaluation);
    }
  );
  await reviewEvaluation.reload();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const anonymousReview = reviewEvaluation.getAnonymousVersionWithReviewerNetid();
  res.send(anonymousReview);
});

// distribute the reviews for an assignment
router.post(
  "/distribute",
  validateQuery(assignmentIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentId: number = req.query.assignmentId as any;
    const assignment = await Assignment.findOne(assignmentId);
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
    // assignmentstate
    if (!assignment.isAtState(AssignmentState.WAITING_FOR_REVIEW)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "The submission state has not been passed or reviews are already assigned"
        );
      return;
    }
    for (const assignmentVersion of assignment.versions) {
      const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
      if (!questionnaire) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
        return;
      }
      if (questionnaire.questions.length === 0) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("The questionnaire doesn't have questions");
        return;
      }
      // check whether there is a question without option:
      for (const question of questionnaire.questions) {
        if (
          question instanceof CheckboxQuestion ||
          question instanceof MultipleChoiceQuestion
        ) {
          if (question.options.length === 0) {
            res
              .status(HttpStatusCode.FORBIDDEN)
              .send(
                "One of the questions in the questionnaire doesn't have options"
              );
            return;
          }
        }
      }
      // check for existing reviews
      const existingReviews = await questionnaire.getReviews();
      if (existingReviews.length > 0) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("There are already reviews for this assignment");
        return;
      }
    }

    // Check whether all versions are reviewed
    // ans all VersionsToReview are not empty
    const assignmentVersions = assignment.versions;
    // check for every version whether it is reviewed
    for (const assignmentVersion of assignmentVersions) {
      if ((await assignmentVersion.getVersionsToReview()).length === 0) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send(
            `assignmentVersion with id ${assignmentVersion.id} is not reviewing any assignmentVersions`
          );
        return;
      }

      let isReviewed = false;
      // check all other assignmentversions
      for (const otherAssignmentVersion of assignmentVersions) {
        const versionsToReview = await otherAssignmentVersion.getVersionsToReview();
        // check all other assignmentversions whether it is reviewing the version
        for (const versionToReview of versionsToReview) {
          if (versionToReview.id === assignmentVersion.id) {
            isReviewed = true;
          }
        }
      }
      if (!isReviewed) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send(
            `assignmentVersion with id ${assignmentVersion.id} is not reviewed by another assignmentVersion`
          );
        return;
      }
    }

    // offload a function to a worker
    startDistributeReviewsForAssignmentWorker(assignment.id);

    // send message that reviews are being distributed
    res.send();
  }
);

export default router;
