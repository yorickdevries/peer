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
import AssignmentState from "../enum/AssignmentState";
import { getManager } from "typeorm";
import ResponseMessage from "../enum/ResponseMessage";
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
  const submissions = await assignment.getSubmissions();
  const sortedSubmissions = _.sortBy(submissions, "id");
  res.send(sortedSubmissions);
});

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
    if (!req.file) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("file is needed for the submission");
      return;
    }
    const group = await Group.findOne(req.body.groupId);
    if (!group) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.GROUP_NOT_FOUND);
      return;
    }
    const assignment = await Assignment.findOne(req.body.assignmentId);
    if (!assignment) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }
    if (
      !(await group.hasUser(user)) ||
      !(await group.hasAssignment(assignment))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not allowed to submit.");
      return;
    }
    if (!(assignment.getState() === AssignmentState.SUBMISSION)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in submission state");
      return;
    }
    // make the submission here in a transaction
    let submission: Submission;

    // start transaction make sure the file and submission are both saved
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // create the file object
        const fileBuffer = req.file.buffer;
        const fileExtension = path.extname(req.file.originalname);
        const fileName = path.basename(req.file.originalname, fileExtension);
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
    await submission!.reload();
    res.send(submission!);
  }
);

export default router;
