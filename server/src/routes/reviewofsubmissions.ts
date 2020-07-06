import express from "express";
import Joi from "@hapi/joi";
import {
  validateQuery,
  validateParams,
  idSchema,
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
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";

const router = express.Router();

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  submitted: Joi.boolean(),
});
// get all the groups for an assignment
router.get("/", validateQuery(assignmentIdSchema), async (req, res) => {
  const user = req.user!;
  const assignmentId = req.query.assignmentId as any;
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
  const submitted = req.query.submitted as any;
  const reviews = await questionnaire.getReviews(submitted);
  const sortedReviews = _.sortBy(reviews, "id");
  res.send(sortedReviews);
});

// get a review eitehr as teacher or student
router.get("/:id", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (await review.isTeacherInCourse(user)) {
    res.send(review);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  const assignmentState = assignment.getState();
  if (
    // reviewer should access the review when reviewing
    ((await review.isReviewer(user)) &&
      (assignmentState === AssignmentState.REVIEW ||
        assignmentState === AssignmentState.FEEDBACK)) ||
    // reviewed user should access the review when getting feedback and the review is finished
    ((await review.isReviewed(user)) &&
      assignmentState === AssignmentState.FEEDBACK &&
      review.submitted)
  ) {
    const anonymousReview = review.getAnonymousVersion();
    res.send(anonymousReview);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
});

// get a review eitehr as teacher or student
router.get("/:id/answers", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  const reviewAnswers = await review.getQuestionAnswers();
  const sortedReviewAnswers = _.sortBy(reviewAnswers, "questionId");
  if (await review.isTeacherInCourse(user)) {
    res.send(sortedReviewAnswers);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  const assignmentState = assignment.getState();
  if (
    // reviewer should access the review when reviewing
    ((await review.isReviewer(user)) &&
      (assignmentState === AssignmentState.REVIEW ||
        assignmentState === AssignmentState.FEEDBACK)) ||
    // reviewed user should access the review when getting feedback and the review is finished
    ((await review.isReviewed(user)) &&
      assignmentState === AssignmentState.FEEDBACK &&
      review.submitted)
  ) {
    res.send(sortedReviewAnswers);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
});

// get a review eitehr as teacher or student
router.get("/:id/file", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (await review.isTeacherInCourse(user)) {
    res.send(review);
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  const assignmentState = assignment.getState();
  if (
    // reviewer should access the review when reviewing
    (await review.isReviewer(user)) &&
    (assignmentState === AssignmentState.REVIEW ||
      assignmentState === AssignmentState.FEEDBACK)
  ) {
    const submission = await review.submission!;
    const file = await submission.getFile();
    const fileName = file.getFileNamewithExtension();
    const filePath = file.getPath();
    res.download(filePath, fileName);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
});

// submit a review
router.post("/:id/submit", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.params.id);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (!(await review.isReviewer(user))) {
    res.status(HttpStatusCode.FORBIDDEN).send("You are not the reviewer");
    return;
  }
  if (review.submitted) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The review is already submitted");
    return;
  }
  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  const assignmentState = assignment.getState();
  if (assignmentState !== AssignmentState.REVIEW) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is not in review state");
    return;
  }
  // check whether the review is fully filled in
  for (const question of questionnaire.questions) {
    if (!question.optional) {
      if (!(await review.getAnswer(question))) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("The review is not fully filled in");
        return;
      }
    }
  }
  review.submitted = true;
  await review.save();
  const anonymousReview = review.getAnonymousVersion();
  res.send(anonymousReview);
  return;
});

// distribute the reviews for an assignment
router.post(
  "/distribute",
  validateQuery(assignmentIdSchema),
  async (req, res) => {
    const user = req.user!;
    const assignmentId = req.query.assignmentId as any;
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
    const assignmentState = assignment.getState();
    if (
      assignmentState === AssignmentState.UNPUBLISHED ||
      assignmentState === AssignmentState.SUBMISSION
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The submission state has not been passed");
      return;
    }
    const questionnaire = await assignment.getSubmissionQuestionnaire();
    if (!questionnaire) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.QUESTIONNAIRE_NOT_FOUND);
      return;
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
        const existingReviews = (
          await transactionalEntityManager.findOneOrFail(
            SubmissionQuestionnaire,
            questionnaire.id,
            {
              relations: ["reviews"],
            }
          )
        ).reviews!;
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
            null,
            reviewAssignment.submission
          );
          await transactionalEntityManager.save(review);
          reviews.push(review);
        }
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
