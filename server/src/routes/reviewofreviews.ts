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

const router = express.Router();

// get a review eitehr as teacher or student
router.get("/:id", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const reviewOfReview = await ReviewOfReview.findOne(req.params.id);
  if (!reviewOfReview) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (await reviewOfReview.isTeacherInCourse(user)) {
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

// get a review eitehr as teacher or student
router.get("/:id/answers", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const reviewOfReview = await ReviewOfReview.findOne(req.params.id);
  if (!reviewOfReview) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  const reviewAnswers = await reviewOfReview.getQuestionAnswers();
  const sortedReviewAnswers = _.sortBy(reviewAnswers, "questionId");
  if (await reviewOfReview.isTeacherInCourse(user)) {
    res.send(sortedReviewAnswers);
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
  res.send(sortedReviewAnswers);
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
    const user = req.user!;
    const review = await ReviewOfReview.findOne(req.params.id);
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
    if (!moment().isBefore(assignment.reviewEvaluationDueDate)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in review state");
      return;
    }
    // set new values
    review.submitted = req.body.submitted;
    review.flaggedByReviewer = req.body.flaggedByReviewer;
    await review.save();
    const anonymousReview = review.getAnonymousVersion();
    res.send(anonymousReview);
    return;
  }
);

export default router;
