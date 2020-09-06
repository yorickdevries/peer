import express from "express";
import File from "../models/File";
import PDFAnnotation from "../models/PDFAnnotation";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import {
  validateBody,
  validateParams,
  idStringSchema,
  validateQuery,
} from "../middleware/validation";
import Joi from "@hapi/joi";
import PDFAnnotationMotivation from "../enum/PDFAnnotationMotivation";
import CommentingPDFAnnotation from "../models/CommentingPDFAnnotation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ReplyingPDFAnnotation from "../models/ReplyingPDFAnnotation";
import { getManager } from "typeorm";
import ResponseMessage from "../enum/ResponseMessage";
import { AssignmentState } from "../enum/AssignmentState";
import moment from "moment";

const router = express.Router();

// Joi inputvalidation for query
const getAnnotationSchema = Joi.object({
  reviewId: Joi.number().integer().required(),
  fileId: Joi.number().integer().required(),
});
router.get("/", validateQuery(getAnnotationSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewId: number = req.query.reviewId as any;
  const review = await ReviewOfSubmission.findOne(reviewId);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileId: number = req.query.fileId as any;
  const file = await File.findOne(fileId);
  if (!file) {
    res.status(HttpStatusCode.NOT_FOUND).send("File not found");
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (review.submission!.file.id !== file.id) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("File and review do not correspond");
  }

  // GET THE ANNOTATIONS
  const commentingPDFAnnotations = await CommentingPDFAnnotation.find({
    where: { review: review, file: file },
  });
  const replyingPDFAnnotations = await ReplyingPDFAnnotation.find({
    where: { review: review, file: file },
  });
  const webAnnotations = [];
  // sort the webannotations so comments are loaded before replys
  for (const annotation of commentingPDFAnnotations) {
    webAnnotations.push(await annotation.getWebAnnotationVersion());
  }
  for (const annotation of replyingPDFAnnotations) {
    webAnnotations.push(await annotation.getWebAnnotationVersion());
  }
  // FINISHED GETTING THE ANNOTATIONS

  // get assignmentstate
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  if (
    (await review.isTeacherOrTeachingAssistantInCourse(user)) ||
    // reviewer should access the review when reviewing
    ((await review.isReviewer(user)) &&
      assignment.isAtOrAfterState(AssignmentState.REVIEW))
  ) {
    res.send(webAnnotations);
    return;
  }
  // reviewed user should access the review when getting feedback and the review is finished
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    if (await questionnaire.hasUnsubmittedReviewsWhereUserIsReviewer(user)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "One of youre reviews isn't submitted, you are not allowed to see feedback"
        );
      return;
    }
    // anomise the annotations for the reviewed
    for (const webAnnotation of webAnnotations) {
      webAnnotation.creator.name = `reviewer ${review.id}`;
    }
    res.send(webAnnotations);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are not allowed to view this review");
});

// Joi inputvalidation
const annotationSchema = Joi.object({
  reviewId: Joi.number().integer().required(),
  fileId: Joi.number().integer().required(),
  annotation: Joi.object({
    id: Joi.string().required(),
    bodyValue: Joi.string().allow("").required(),
    motivation: Joi.string().valid(...Object.values(PDFAnnotationMotivation)),
    target: Joi.object({
      source: Joi.string().required(),
      selector: Joi.object(),
    }).required(),
  })
    .required()
    .unknown(),
});
router.post("/", validateBody(annotationSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const review = await ReviewOfSubmission.findOne(req.body.reviewId);
  if (!review) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.REVIEW_NOT_FOUND);
    return;
  }
  const file = await File.findOne(req.body.fileId);
  if (!file) {
    res.status(HttpStatusCode.NOT_FOUND).send("File not found");
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (review.submission!.file.id !== file.id) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("File and review do not correspond");
  }
  if (!(await review.isReviewer(user))) {
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
  const assignment = await questionnaire.getAssignment();
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
  const annotation = req.body.annotation;
  const existingAnnotation = await PDFAnnotation.findOne(annotation.id);
  if (existingAnnotation) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(`Annotation with id ${annotation.id} already exists`);
    return;
  }
  // COMMENTING
  if (annotation.motivation === PDFAnnotationMotivation.COMMENTING) {
    const selector = annotation.target.selector;
    if (!selector) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Selector needs to be defined in a commenting annotation");
      return;
    }
    const commentingPDFAnnotation = new CommentingPDFAnnotation(
      annotation.id,
      annotation.bodyValue,
      user,
      file,
      review,
      selector
    );
    await commentingPDFAnnotation.save();
    res.send(commentingPDFAnnotation);
    return;
    // REPLYING
  } else if (annotation.motivation === PDFAnnotationMotivation.REPLYING) {
    const commentingPDFAnnotationId = annotation.target.source;
    const commentingPDFAnnotation = await CommentingPDFAnnotation.findOneOrFail(
      commentingPDFAnnotationId
    );
    if (!commentingPDFAnnotation) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("CommentingPDFAnnotation is not found");
      return;
    }
    const replyingPDFAnnotation = new ReplyingPDFAnnotation(
      annotation.id,
      annotation.bodyValue,
      user,
      file,
      review,
      commentingPDFAnnotation
    );
    await replyingPDFAnnotation.save();
    res.send(replyingPDFAnnotation);
  } else {
    // should never happed due to input validation
    throw new Error("Invalid motivation: " + annotation.motivation);
  }
});

// Joi inputvalidation
const patchAnnotationSchema = Joi.object({
  annotation: Joi.object({
    id: Joi.string().required(),
    bodyValue: Joi.string().allow("").required(),
    target: Joi.object({
      source: Joi.string().required(),
      selector: Joi.object(),
    }).required(),
  })
    .required()
    .unknown(),
});
router.patch(
  "/:id",
  validateParams(idStringSchema),
  validateBody(patchAnnotationSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const annotation = await PDFAnnotation.findOne(req.params.id);
    if (!annotation) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(`Annotation with id ${req.params.id} does not exist`);
      return;
    }
    const review = await annotation.getReview();
    if (!(await review.isReviewer(user))) {
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
    const assignment = await questionnaire.getAssignment();
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
    // perform patch
    if (annotation instanceof CommentingPDFAnnotation) {
      annotation.selector = req.body.annotation.target.selector;
    }
    annotation.bodyValue = req.body.annotation.bodyValue;
    await annotation.save();
    res.send(annotation);
  }
);

router.delete("/:id", validateParams(idStringSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const annotation = await PDFAnnotation.findOne(req.params.id);
  if (!annotation) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(`Annotation with id ${req.params.id} does not exist`);
    return;
  }
  const review = await annotation.getReview();
  if (!(await review.isReviewer(user))) {
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
  const assignment = await questionnaire.getAssignment();
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
  if (annotation instanceof CommentingPDFAnnotation) {
    // delete annotation including replies
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        const commentingPDFAnnotationWithReplies = await transactionalEntityManager.findOneOrFail(
          CommentingPDFAnnotation,
          annotation.id,
          {
            relations: ["replyingPDFAnnotations"],
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const replyingPDFAnnotations = commentingPDFAnnotationWithReplies.replyingPDFAnnotations!;
        // delete all replies
        for (const replyingPDFAnnotation of replyingPDFAnnotations) {
          await transactionalEntityManager.remove(replyingPDFAnnotation);
        }
        // delete comment
        await transactionalEntityManager.remove(
          commentingPDFAnnotationWithReplies
        );
      }
    );
    res.send(annotation);
  } else if (annotation instanceof ReplyingPDFAnnotation) {
    // remove annotation
    await annotation.remove();
    res.send(annotation);
  } else {
    // should never happed due to input validation
    throw new Error("Invalid PDFAnnotation");
  }
});

export default router;
