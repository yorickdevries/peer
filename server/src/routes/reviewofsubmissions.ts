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
import generateReviewDistribution from "../util/reviewDistribution";
import User from "../models/User";
import Submission from "../models/Submission";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import { getManager } from "typeorm";
import moment from "moment";
import ReviewOfReview from "../models/ReviewOfReview";
import makeGradeSummaries from "../util/makeGradeSummary";
import exportJSONToFile from "../util/exportJSONToFile";
import parseReviewsForExport from "../util/parseReviewsForExport";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import Review from "../models/Review";

const router = express.Router();

// Joi inputvalidation for query
const assignmentSubmitIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  submitted: Joi.boolean(),
});
// get all the reviews for an assignment
router.get("/", validateQuery(assignmentSubmitIdSchema), async (req, res) => {
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
    !(await assignment.isTeacherOrTeachingAssistantInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
    return;
  }
  const questionnaire = await assignment.getSubmissionQuestionnaire();
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
  assignmentId: Joi.number().integer().required(),
  exportType: Joi.string().valid("csv", "xls"),
});
router.get(
  "/exportgrades",
  validateQuery(assignmentExportIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentId: number = req.query.assignmentId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportType: "csv" | "xls" = req.query.exportType as any;
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
    const questionnaire = await assignment.getSubmissionQuestionnaire();
    if (!questionnaire) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
    }
    const submitted = true;
    const reviews = await questionnaire.getReviews(submitted);
    const gradeSummaries = makeGradeSummaries(reviews);
    const filename = `assignment${assignment.id}_grades`;
    exportJSONToFile(gradeSummaries, filename, exportType, res);
  }
);

router.get(
  "/exportreviews",
  validateQuery(assignmentExportIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentId: number = req.query.assignmentId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportType: "csv" | "xls" = req.query.exportType as any;
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
    const questionnaire = await assignment.getSubmissionQuestionnaire();
    if (!questionnaire) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
    }
    const parsedReviews = await parseReviewsForExport(questionnaire);
    const filename = `assignment${assignment.id}_reviews`;
    exportJSONToFile(parsedReviews, filename, exportType, res);
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
    if (assignment.reviewEvaluation && !assignment.reviewQuestionnaireId) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("No reviewQuestionnaire is present to evaluate the reviews");
      return;
    }
    const reviewQuestionnaire = await assignment.getReviewQuestionnaire();
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

    const questionnaire = await assignment.getSubmissionQuestionnaire();
    if (!questionnaire) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
    }
    const submitted = false;
    const unsubmittedReviews = await questionnaire.getReviews(submitted);
    const submittedReviews = [];
    for (const review of unsubmittedReviews) {
      if (await review.canBeSubmitted()) {
        review.submitted = true;
        review.submittedAt = new Date();
        await review.save();
        submittedReviews.push(review);
      }
    }
    assignment.state = AssignmentState.FEEDBACK;
    await assignment.save();
    res.send(assignment);
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
  const assignment = await questionnaire.getAssignment();
  const anonymousReview = review.getAnonymousVersion();
  // reviewer should access the review when reviewing
  if (
    (await review.isReviewer(user)) &&
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
  const assignment = await questionnaire.getAssignment();
  if (
    // reviewer should access the review when reviewing
    ((await review.isReviewer(user)) &&
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
  const assignment = await questionnaire.getAssignment();
  if (
    (await review.isReviewer(user)) &&
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
  const assignment = await questionnaire.getAssignment();
  if (
    (await review.isReviewer(user)) &&
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
    if (!(await review.isReviewer(user))) {
      res.status(HttpStatusCode.FORBIDDEN).send("You are not the reviewer");
      return;
    }
    // get assignmentstate
    const questionnaire = await review.getQuestionnaire();
    const assignment = await questionnaire.getAssignment();
    // Review cannot be changed (unsubmitted/flagged) in feedback phase when submitted
    if (assignment.isAtState(AssignmentState.FEEDBACK) && review.submitted) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in review state");
      return;
    }
    // set new values
    review.submitted = req.body.submitted;
    if (review.submitted) {
      review.submittedAt = new Date();
    } else {
      review.submittedAt = null;
    }
    review.flaggedByReviewer = req.body.flaggedByReviewer;
    // check whether the review can be submitted before trying to save
    if (review.submitted && !(await review.canBeSubmitted())) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("A non-optional question isn't answered yet.");
      return;
    }
    await review.save();
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
    const assignment = await questionnaire.getAssignment();
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
  const assignment = await submissionQuestionnaire.getAssignment();
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
  const assignment = await submissionQuestionnaire.getAssignment();
  if (
    !(
      (await review.isReviewed(user)) &&
      assignment.isAtState(AssignmentState.FEEDBACK) &&
      review.submitted &&
      assignment.reviewEvaluation &&
      moment().isBefore(assignment.reviewEvaluationDueDate)
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to evaluate this review");
    return;
  }
  const reviewQuestionnaire = await assignment.getReviewQuestionnaire();
  if (!reviewQuestionnaire) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
    return;
  }
  // create the reviewEvaluation
  let reviewEvaluation: ReviewOfReview;
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // check whether the review is already evaluated
      const existingReview = await transactionalEntityManager.findOne(
        ReviewOfReview,
        { where: { reviewOfSubmission: review.id } }
      );
      if (existingReview) {
        throw new Error("There already exists a reviewEvaluation");
      }
      // create review
      reviewEvaluation = new ReviewOfReview(
        reviewQuestionnaire,
        user,
        false,
        false,
        null,
        null,
        null,
        null,
        null,
        review
      );
      // set startedAt
      reviewEvaluation.startedAt = new Date();
      await transactionalEntityManager.save(reviewEvaluation);
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await reviewEvaluation!.reload();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const anonymousReview = reviewEvaluation!.getAnonymousVersionWithReviewerNetid();
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
    const questionnaire = await assignment.getSubmissionQuestionnaire();
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

    // now the reviews can be dirsibuted
    const submissions = await assignment.getLatestSubmissionsOfEachGroup();
    // get all unique users of the submissions (unique as several submissions might have the same user in the group)
    const users: User[] = [];
    for (const submission of submissions) {
      const group = await submission.getGroup();
      const groupUsers = await group.getUsers();
      for (const groupUser of groupUsers) {
        const alreadyContainsUser = _.some(users, (user) => {
          return user.netid === groupUser.netid;
        });
        if (!alreadyContainsUser) {
          users.push(groupUser);
        }
      }
    }
    interface reviewAssignment {
      reviewer: User;
      submission: Submission;
    }
    let reviewDistribution: reviewAssignment[];
    try {
      // can throw error
      reviewDistribution = await generateReviewDistribution(
        submissions,
        users,
        assignment.reviewsPerUser
      );
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
      return;
    }
    // create all reviews in an transaction
    const reviews: ReviewOfSubmission[] = [];
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const existingReviews = await transactionalEntityManager.find(Review, {
          where: { questionnaire: questionnaire },
        });
        if (existingReviews.length > 0) {
          throw new Error("There are already reviews for this assignment");
        }
        // iterate over reviewDistribution
        for (const reviewAssignment of reviewDistribution) {
          // make the review
          const review = new ReviewOfSubmission(
            questionnaire,
            reviewAssignment.reviewer,
            false,
            false,
            null,
            null,
            null,
            null,
            null,
            reviewAssignment.submission
          );
          await transactionalEntityManager.save(review);
          reviews.push(review);
        }
        // set the proper assignmentstate
        assignment.state = AssignmentState.REVIEW;
        await transactionalEntityManager.save(assignment);
      }
    );
    // reload the groups from the database
    for (const review of reviews) {
      await review.reload();
    }
    res.send(reviews);
  }
);

export default router;
