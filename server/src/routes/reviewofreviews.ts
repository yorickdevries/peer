import express from "express";
import Joi from "@hapi/joi";
import {
  validateParams,
  idSchema,
  validateBody,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import _ from "lodash";
import ReviewOfReview from "../models/ReviewOfReview";
import moment from "moment";
import submitReview from "../util/submitReview";

const router = express.Router();

// get a review either as teacher or student
router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const reviewOfReview = await ReviewOfReview.findOne(req.params.id);
  if (!reviewOfReview) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (await reviewOfReview.isTeacherOrTeachingAssistantInCourse(user)) {
    res.send(reviewOfReview);
    return;
  }
  // check whether the reviewofreview is about the submission the user was part of
  const reviewOfSubmission = await reviewOfReview.getReviewOfSubmission();
  if (!(await reviewOfSubmission.isReviewed(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to evaluate this review");
    return;
  }
  const anonymousReview = reviewOfReview.getAnonymousVersion();
  res.send(anonymousReview);
});

// get a review answers either as teacher or student
router.get("/:id/answers", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const reviewOfReview = await ReviewOfReview.findOne(req.params.id);
  if (!reviewOfReview) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  const reviewAnswers = await reviewOfReview.getQuestionAnswers();
  const sortedReviewAnswers = _.sortBy(reviewAnswers, "questionId");
  if (await reviewOfReview.isTeacherOrTeachingAssistantInCourse(user)) {
    res.send(sortedReviewAnswers);
    return;
  }
  // check whether the reviewofreview is about the submission the user was part of
  const reviewOfSubmission = await reviewOfReview.getReviewOfSubmission();
  if (await reviewOfSubmission.isReviewed(user)) {
    res.send(sortedReviewAnswers);
    return;
  }
  if ((await reviewOfReview.isReviewed(user)) && reviewOfReview.submitted) {
    res.send(sortedReviewAnswers);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to evaluate this review");
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
    const review = await ReviewOfReview.findOne(req.params.id);
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
      !assignment.lateReviewEvaluations &&
      moment().isAfter(assignment.reviewEvaluationDueDate)
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "The due date for review evaluation has passed and late review evaluations are not allowed by the teacher"
        );
      return;
    }
    // Review cannot be changed (unsubmitted/flagged) in after the deadline when submitted
    if (
      moment().isAfter(assignment.reviewEvaluationDueDate) &&
      review.submitted
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The due date for review evaluation has passed");
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

export default router;
