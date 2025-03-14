import express from "express";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import CodeAnnotation from "../models/CodeAnnotation";
import {
  idSchema,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import config from "config";
import Joi from "joi";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import { AssignmentState } from "../enum/AssignmentState";
import moment from "moment";

const router = express.Router();

const maxAnnotationLength = config.get("maxCodeAnnotationLength") as number;

router.get("/getmaxannotationlength", async (_req, res) => {
  res.status(HttpStatusCode.OK).send(maxAnnotationLength.toString());
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
          "One of your reviews isn't submitted, you are not allowed to see feedback"
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
  annotationText: Joi.string().max(maxAnnotationLength),
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
  const codeAnnotation = new CodeAnnotation(
    review,
    req.body.annotationText,
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
  annotationText: Joi.string().required().max(maxAnnotationLength),
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
    annotation.annotationText = req.body.annotationText;
    await CodeAnnotation.save(annotation);
    res.send(annotation);
  }
);

export default router;
