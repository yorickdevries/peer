import express from "express";
import Joi from "@hapi/joi";
import { validateQuery, validateBody } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Group from "../models/Group";
import config from "config";
import Submission from "../models/Submission";
import File from "../models/File";
import path from "path";
import hasha from "hasha";
import fsPromises from "fs/promises";
import upload from "../middleware/upload";
import assignmentState from "../enum/assignmentState";
import { getManager } from "typeorm";
import _ from "lodash";

// config values
const uploadFolder = config.get("uploadFolder") as string;
const allowedExtensions = config.get("allowedExtensions") as string[];
const maxFileSize = config.get("maxFileSize") as number;

const router = express.Router();

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// get all the submissions for an assignment
router.get("/", validateQuery(assignmentIdSchema), async (req, res) => {
  const user = req.user!;
  const assignmentId = req.query.assignmentId as any;
  try {
    const assignment = await Assignment.findOneOrFail(assignmentId);
    if (await assignment.isTeacherOfCourse(user)) {
      const submissions = await assignment.getSubmissions();
      const sortedSubmissions = _.sortBy(submissions, "id");
      res.send(sortedSubmissions);
    } else {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("User is not a teacher for the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

// Joi inputvalidation for query
const querySubmissionSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  groupId: Joi.number().integer().required(),
});
// get the submissions of a group
router.get(
  "/enrolled",
  validateQuery(querySubmissionSchema),
  async (req, res) => {
    const user = req.user!;
    const assignmentId = req.query.assignmentId as any;
    const groupId = req.query.groupId as any;
    try {
      const assignment = await Assignment.findOneOrFail(assignmentId);
      const group = await Group.findOneOrFail(groupId);
      if (await group.hasUser(user)) {
        const submissions = await assignment.getSubmissions(group);
        const sortedSubmissions = _.sortBy(submissions, "id");
        res.send(sortedSubmissions);
      } else {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("User is part of the group");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

// Joi inputvalidation
const submissionSchema = Joi.object({
  groupId: Joi.number().integer().required(),
  assignmentId: Joi.number().integer().required(),
});
// post a submission in a course
router.post(
  "/",
  upload(allowedExtensions, maxFileSize, "file"),
  validateBody(submissionSchema),
  async (req, res) => {
    const user = req.user!;
    try {
      const group = await Group.findOneOrFail(req.body.groupId);
      const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
      if (
        (await group.hasUser(user)) &&
        (await group.hasAssignment(assignment))
      ) {
        if (assignment.getState() === assignmentState.SUBMISSION) {
          // make the submission here in a transation
          let submission: Submission;

          // start transaction make sure the file and submission are both saved
          await getManager().transaction(
            "SERIALIZABLE",
            async (transactionalEntityManager) => {
              if (!req.file) {
                throw "file is needed for the submission";
              }

              // create the file object
              const fileBuffer = req.file.buffer;
              const fileExtension = path.extname(req.file.originalname);
              const fileName = path.basename(
                req.file.originalname,
                fileExtension
              );
              const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
              const file = new File(fileName, fileExtension, fileHash);

              await transactionalEntityManager.save(file);

              // create submission
              submission = new Submission(user, group, assignment, file);
              await transactionalEntityManager.save(submission);

              // save the file to disk lastly
              // (if this goes wrong all previous steps are rolled back)
              const filePath = path.resolve(uploadFolder, file.id!.toString());
              await fsPromises.writeFile(filePath, req.file.buffer);
            }
          );
          // reload submission to get all data
          // submission should be defined now (else we would be in the catch)
          await submission!.reload();
          res.send(submission!);
        } else {
          res
            .status(HttpStatusCode.FORBIDDEN)
            .send("The assignment is not in submission state");
        }
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("User is not allowed to submit.");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
