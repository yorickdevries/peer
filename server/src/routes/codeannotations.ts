import express from "express";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import CodeAnnotation from "../models/CodeAnnotation";
import {
  validateQuery,
  validateBody,
  idSchema,
  validateParams,
} from "../middleware/validation";
import Joi from "@hapi/joi";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import { AssignmentState } from "../enum/AssignmentState";
import moment from "moment";

const router = express.Router();
const maxCommentLength = 255;

router.get("/getMaxCommentLength", async (req, res) => {
  const user = req.user;
  if (!user) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("Please make sure you are logged in.");
  }
  res.status(HttpStatusCode.OK).send(maxCommentLength.toString());
});

// Joi inputvalidation for query
const getAnnotationsSchema = Joi.object({
  reviewId: Joi.number().integer().required(),
});
router.get("/", validateQuery(getAnnotationsSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewId: number = req.query.reviewId as any;
  const review = await ReviewOfSubmission.findOne(reviewId);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  // GET CODE ANNOTATIONS
  const codeAnnotations = await CodeAnnotation.find({
    where: { review: review },
  });

  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    (await review.isTeacherOrTeachingAssistantInCourse(user)) ||
    // reviewer should access the review when reviewing
    (review.isReviewer(user) &&
      assignment.isAtOrAfterState(AssignmentState.REVIEW))
  ) {
    res.send(codeAnnotations);
    return;
  }
  // reviewed user should access the review when getting feedback and the review is finished
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    if (
      assignment.blockFeedback &&
      (await assignment.hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(
        user
      ))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "One of youre reviews isn't submitted, you are not allowed to see feedback"
        );
      return;
    }
    // TO DO Anonymize code annotations
    res.send(codeAnnotations);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
});

// Joi inputvalidation
const annotationSchema = Joi.object({
  reviewId: Joi.number().integer().required(),
  commentText: Joi.string().max(maxCommentLength),
  startLineNumber: Joi.number().integer(),
  endLineNumber: Joi.number().integer(),
  selectedFile: Joi.string(),
});
router.post("/", validateBody(annotationSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.body.reviewId);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  if (!review.isReviewer(user)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not the reviewer of this review");
    return;
  }
  if (review.submitted) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The review is already submitted");
    return;
  }
  // get assignment
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
  // create the annotation
  /*const existingAnnotation = await CodeAnnotation.findOne(annotation.id);
  if (existingAnnotation) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(`Annotation with id ${annotation.id} already exists`);
    return;
  }
  */
  // COMMENTING
  const codeAnnotation = new CodeAnnotation(
    review,
    req.body.commentText,
    req.body.startLineNumber,
    req.body.endLineNumber,
    req.body.selectedFile
  );
  await codeAnnotation.save();
  res.send(codeAnnotation);
});

router.delete("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const annotation = await CodeAnnotation.findOne(req.params.id);
  if (!annotation) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(`Annotation with id ${req.params.id} does not exist`);
    return;
  }
  const review = await annotation.getReview();
  if (!review.isReviewer(user)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not the reviewer of this review");
    return;
  }
  if (review.submitted) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The review is already submitted");
    return;
  }
  // get assignment
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
  await annotation.remove();
  res.send(annotation);
});

const updateAnnotationSchema = Joi.object({
  commentText: Joi.string().required().max(maxCommentLength),
});

router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(updateAnnotationSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const annotation = await CodeAnnotation.findOne(req.params.id);
    if (!annotation) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(`Annotation with id ${req.params.id} does not exist`);
      return;
    }
    const review = await annotation.getReview();
    if (!review.isReviewer(user)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You are not the reviewer of this review");
      return;
    }
    if (review.submitted) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The review is already submitted");
      return;
    }
    // get assignment
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
    annotation.commentText = req.body.commentText;
    await CodeAnnotation.save(annotation);
    res.send(annotation);
  }
);

export default router;
