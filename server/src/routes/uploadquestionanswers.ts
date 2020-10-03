import express from "express";
import Joi from "@hapi/joi";
import { validateBody, validateQuery } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import UploadQuestion from "../models/UploadQuestion";
import ResponseMessage from "../enum/ResponseMessage";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import UploadQuestionAnswer from "../models/UploadQuestionAnswer";
import File from "../models/File";
import upload from "../middleware/upload";
import config from "config";
import { getManager } from "typeorm";
import path from "path";
import fsPromises from "fs/promises";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import moment from "moment";
import removePDFMetadata from "../util/removePDFMetadata";

const router = express.Router();

// config values
const uploadFolder = config.get("uploadFolder") as string;
const allowedExtensions = config.get("allowedExtensions") as string[];
const maxFileSize = config.get("maxFileSize") as number;

const querySchema = Joi.object({
  reviewId: Joi.number().integer().required(),
  questionId: Joi.number().integer().required(),
});
// get the file of an uplloadquestion
router.get("/file", validateQuery(querySchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const uploadQuestionAnswer = await UploadQuestionAnswer.findOne({
    where: req.query,
  });
  if (!uploadQuestionAnswer) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.ANSWER_NOT_FOUND);
    return;
  }
  const review = await uploadQuestionAnswer.getReview();
  const questionnaire = await review.getQuestionnaire();
  const assignment = await questionnaire.getAssignment();
  if (
    // is teacher
    (await assignment.isTeacherOrTeachingAssistantInCourse(user)) ||
    // or reviwer
    review.isReviewer(user)
  ) {
    // get the file
    const file = uploadQuestionAnswer.uploadAnswer;
    const fileName = file.getFileNamewithExtension();
    const filePath = file.getPath();
    res.download(filePath, fileName);
    return;
  }
  if (
    (await review.isReviewed(user)) &&
    assignment.isAtState(AssignmentState.FEEDBACK) &&
    review.submitted
  ) {
    if (
      assignment.blockFeedback &&
      (await questionnaire.hasUnsubmittedReviewsWhereUserIsReviewer(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "One of youre reviews isn't submitted, you are not allowed to see feedback"
        );
      return;
    }
    // get the file
    const file = uploadQuestionAnswer.uploadAnswer;
    const fileName = file.getAnonymousFileNamewithExtension();
    const filePath = file.getPath();
    res.download(filePath, fileName);
    return;
  }
  res
    .status(HttpStatusCode.FORBIDDEN)
    .send("You are allowed to access this review");
});

// Joi inputvalidation
const uploadAnswerSchema = Joi.object({
  uploadQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
});
// post an uploadAnswer
// overwrites existing if already exists
router.post(
  "/",
  upload(allowedExtensions, maxFileSize, "file"),
  validateBody(uploadAnswerSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    if (!req.file) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("File is needed for the answer");
      return;
    }
    const question = await UploadQuestion.findOne(req.body.uploadQuestionId);
    if (!question) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.QUESTION_NOT_FOUND);
      return;
    }
    const review = await Review.findOne(req.body.reviewId);
    if (!review) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.REVIEW_NOT_FOUND);
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
    const questionnaire = await review.getQuestionnaire();
    if (!questionnaire.containsQuestion(question)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("The question is not part of this review");
      return;
    }
    const assignment = await questionnaire.getAssignment();
    if (
      questionnaire instanceof SubmissionQuestionnaire &&
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
    if (
      questionnaire instanceof ReviewQuestionnaire &&
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
    // construct file to be saved in transaction
    const fileExtension = path.extname(req.file.originalname);
    const fileName = path.basename(req.file.originalname, fileExtension);
    // run removePDFMetadata in case the file is a pdf
    if (fileExtension === ".pdf") {
      await removePDFMetadata(req.file.path);
    }
    const fileHash = null;
    const newFile = new File(fileName, fileExtension, fileHash);

    // new Upload Answer
    const newUploadAnser = new UploadQuestionAnswer(question, review, newFile);
    await newUploadAnser.validateOrReject();

    // oldfile in case of update
    let oldFile: File | undefined;

    // uploadAnswer
    let uploadAnswer: UploadQuestionAnswer | undefined;
    // start transaction make sure the file and submission are both saved
    await getManager().transaction(
      process.env.NODE_ENV === "test" ? "SERIALIZABLE" : "REPEATABLE READ",
      async (transactionalEntityManager) => {
        // fetch existing answer if present
        uploadAnswer = await transactionalEntityManager.findOne(
          UploadQuestionAnswer,
          {
            where: {
              reviewId: review.id,
              questionId: question.id,
            },
          }
        );
        // if an answer is already present, save old file to constant
        if (uploadAnswer) {
          oldFile = uploadAnswer.uploadAnswer;
        }
        // save file entry to database
        await newFile.validateOrReject();
        await transactionalEntityManager.save(newFile);
        // save answer to database
        if (uploadAnswer) {
          uploadAnswer.uploadAnswer = newFile;
        } else {
          uploadAnswer = newUploadAnser;
        }
        // create/update uploadAnswer
        // validation is done for newUploadAnser outside the transaction
        await transactionalEntityManager.save(uploadAnswer);

        // move the file (so if this fails everything above fails)
        // where the file is temporary saved now
        const tempPath = req.file.path;
        // new place where the file will be saved
        const filePath = path.resolve(uploadFolder, newFile.id.toString());
        // move file
        await fsPromises.rename(tempPath, filePath);
      }
    );
    // remove old file lastly so no data is lost
    // worst case this fails and we have a orphan file
    if (oldFile) {
      const oldId = oldFile.id;
      await oldFile.remove();
      const filePath = path.resolve(uploadFolder, oldId.toString());
      await fsPromises.unlink(filePath);
    }

    // reload the answer
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await uploadAnswer!.reload();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(uploadAnswer!);
  }
);

// Joi inputvalidation
const deleteUploadAnswerSchema = Joi.object({
  uploadQuestionId: Joi.number().integer().required(),
  reviewId: Joi.number().integer().required(),
});
// delete an uploadAnswer
router.delete(
  "/",
  validateQuery(deleteUploadAnswerSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let questionAnswer = await UploadQuestionAnswer.findOne({
      where: {
        questionId: req.query.uploadQuestionId,
        reviewId: req.query.reviewId,
      },
    });
    if (!questionAnswer) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send(ResponseMessage.QUESTIONANSWER_NOT_FOUND);
      return;
    }
    const review = await questionAnswer.getReview();
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
    const questionnaire = await review.getQuestionnaire();
    const assignment = await questionnaire.getAssignment();
    if (
      questionnaire instanceof SubmissionQuestionnaire &&
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
    if (
      questionnaire instanceof ReviewQuestionnaire &&
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

    // start transaction to make sure an asnwer isnt deleted from a submitted review
    await getManager().transaction(
      process.env.NODE_ENV === "test" ? "SERIALIZABLE" : "REPEATABLE READ",
      async (transactionalEntityManager) => {
        // const review
        const reviewToCheck = await transactionalEntityManager.findOneOrFail(
          Review,
          review.id
        );
        if (reviewToCheck.submitted) {
          throw new Error("The review is already submitted");
        }
        questionAnswer = await transactionalEntityManager.findOneOrFail(
          UploadQuestionAnswer,
          {
            where: {
              questionId: req.query.uploadQuestionId,
              reviewId: req.query.reviewId,
            },
          }
        );
        // get fileinfo
        const file = questionAnswer.uploadAnswer;
        const filePath = file.getPath();

        await transactionalEntityManager.remove(questionAnswer);
        // delete file as well
        await transactionalEntityManager.remove(file);
        // remove file from disk
        await fsPromises.unlink(filePath);
      }
    );
    res.send(questionAnswer);
  }
);

export default router;
