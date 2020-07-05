import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
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

const router = express.Router();

// config values
const uploadFolder = config.get("uploadFolder") as string;
const allowedExtensions = config.get("allowedExtensions") as string[];
const maxFileSize = config.get("maxFileSize") as number;

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
    const questionnaire = await review.getQuestionnaire();
    if (!questionnaire.containsQuestion(question)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("The question is not part of this review");
      return;
    }
    const assignment = await questionnaire.getAssignment();
    if (assignment.getState() !== AssignmentState.REVIEW) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in reviewstate");
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
        const filePath = path.resolve(uploadFolder, file.id!.toString());
        await fsPromises.writeFile(filePath, req.file.buffer);
      }
    );
    // relaod the answer
    await uploadAnswer!.reload();
    res.send(uploadAnswer);
  }
);

export default router;
