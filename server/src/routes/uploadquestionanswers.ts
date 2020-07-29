import express from "express";
import Joi from "@hapi/joi";
import {
  validateBody,
  validateQuery,
  validateParams,
  idSchema,
} from "../middleware/validation";
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
import hasha from "hasha";
import fsPromises from "fs/promises";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import moment from "moment";

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
    (await assignment.isTeacherInCourse(user)) ||
    // or reviwer
    (await review.isReviewer(user)) ||
    // or reviewed
    (assignment.isAtState(AssignmentState.FEEDBACK) &&
      (await review.isReviewed(user)) &&
      review.submitted)
  ) {
    // get the file
    const file = uploadQuestionAnswer.uploadAnswer;
    const fileName = file.getFileNamewithExtension();
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
      !assignment.isAtState(AssignmentState.REVIEW)
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in reviewstate");
      return;
    }
    if (
      questionnaire instanceof ReviewQuestionnaire &&
      !(
        assignment.isAtState(AssignmentState.FEEDBACK) &&
        moment().isBefore(assignment.reviewEvaluationDueDate)
      )
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The reviewevaluation is passed");
      return;
    }

    // uploadAnswer
    let uploadAnswer: UploadQuestionAnswer | undefined;
    // start transaction make sure the file and submission are both saved
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // file info
        const fileBuffer = req.file.buffer;
        const fileExtension = path.extname(req.file.originalname);
        const fileName = path.basename(req.file.originalname, fileExtension);
        const fileHash = hasha(fileBuffer, { algorithm: "sha256" });

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

        let file: File;
        // if an answer is already present, replace the fileinfo
        if (uploadAnswer?.uploadAnswer) {
          file = uploadAnswer.uploadAnswer;
          file.name = fileName;
          file.extension = fileExtension;
          file.hash = fileHash;
        } else {
          // make new file and answer
          file = new File(fileName, fileExtension, fileHash);
          uploadAnswer = new UploadQuestionAnswer(question, review, file);
        }

        // create/update uploadAnswer
        await transactionalEntityManager.save(file);
        // call validateOrReject separately as this is not called in case only the file is changed
        // and not the uploadAnser itself
        await uploadAnswer.validateOrReject();
        await transactionalEntityManager.save(uploadAnswer);

        // save the file to disk lastly (overwites exisitng if present)
        // (if this goes wrong all previous steps are rolled back)
        const filePath = path.resolve(uploadFolder, file.id.toString());
        await fsPromises.writeFile(filePath, req.file.buffer);
      }
    );
    // reload the answer
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await uploadAnswer!.reload();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(uploadAnswer!);
  }
);

// delete an uploadAnswer
router.delete("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionAnswerId: number = req.params.id as any;
  const questionAnswer = await UploadQuestionAnswer.findOne(questionAnswerId);
  if (!questionAnswer) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.QUESTIONANSWER_NOT_FOUND);
    return;
  }
  const review = await questionAnswer.getReview();
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
  const file = questionAnswer.uploadAnswer;
  const filePath = file.getPath();

  // start transaction to make sure an asnwer isnt deleted from a submitted review
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // const review
      const reviewToCheck = await transactionalEntityManager.findOneOrFail(
        Review,
        review.id
      );
      if (reviewToCheck.submitted) {
        throw new Error("The review is already submitted");
      }
      await transactionalEntityManager.remove(questionAnswer);
      // delete file as well
      await transactionalEntityManager.remove(file);
      await fsPromises.unlink(filePath);
    }
  );
  res.send(questionAnswer);
});

export default router;
