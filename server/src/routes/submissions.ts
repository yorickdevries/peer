import express from "express";
import Joi from "@hapi/joi";
import {
  validateQuery,
  validateBody,
  idSchema,
  validateParams,
} from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Group from "../models/Group";
import config from "config";
import Submission from "../models/Submission";
import File from "../models/File";
import path from "path";
import fsPromises from "fs/promises";
import upload from "../middleware/upload";
import { AssignmentState } from "../enum/AssignmentState";
import ResponseMessage from "../enum/ResponseMessage";
import _ from "lodash";
import moment from "moment";
import { getManager } from "typeorm";

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentId: number = req.query.assignmentId as any;
  const assignment = await Assignment.findOne(assignmentId);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignment.isTeacherOrTeachingAssistantInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
    return;
  }
  const submissions = await assignment.getSubmissions();
  const sortedSubmissions = _.sortBy(submissions, "id");
  res.send(sortedSubmissions);
});

// get the submission
router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const submission = await Submission.findOne(req.params.id);
  if (!submission) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.SUBMISSION_NOT_FOUND);
    return;
  }
  const group = await submission.getGroup();
  const assignment = await submission.getAssignment();
  if (
    !(
      (await group.hasUser(user)) ||
      (await assignment.isTeacherOrTeachingAssistantInCourse(user))
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not part of this group or teacher of the course");
    return;
  }
  res.send(submission);
});

// get the submission file
router.get("/:id/file", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const submission = await Submission.findOne(req.params.id);
  if (!submission) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.SUBMISSION_NOT_FOUND);
    return;
  }
  const group = await submission.getGroup();
  const assignment = await submission.getAssignment();
  if (
    !(
      (await group.hasUser(user)) ||
      (await assignment.isTeacherOrTeachingAssistantInCourse(user))
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not part of this group or teacher of the course");
    return;
  }
  // get the file
  const file = submission.file;
  const fileName = file.getFileNamewithExtension();
  const filePath = file.getPath();
  res.download(filePath, fileName);
});

// get the feedback of a submission
router.get("/:id/feedback", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const submission = await Submission.findOne(req.params.id);
  if (!submission) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.SUBMISSION_NOT_FOUND);
    return;
  }
  const assignment = await submission.getAssignment();
  if (!assignment.isAtState(AssignmentState.FEEDBACK)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view reviews");
    return;
  }
  const submissionQuestionnaire = await assignment.getSubmissionQuestionnaire();
  if (!submissionQuestionnaire) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("No submissionquestionnaire is defined");
    return;
  }
  if (
    assignment.blockFeedback &&
    (await submissionQuestionnaire.hasUnsubmittedReviewsWhereUserIsReviewer(
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
  const group = await submission.getGroup();
  if (!(await group.hasUser(user))) {
    res.status(HttpStatusCode.FORBIDDEN).send("You are not part of this group");
    return;
  }
  const reviewOfSubmissions = await submission.getReviewOfSubmissions();
  const submittedReviews = _.filter(reviewOfSubmissions, (review) => {
    return review.submitted;
  });
  const anonymousReviews = _.map(submittedReviews, (review) => {
    return review.getAnonymousVersion();
  });
  const sortedReviews = _.sortBy(anonymousReviews, "id");
  res.send(sortedReviews);
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    if (!req.file) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("File is needed for the submission");
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
    if (!(await group.hasAssignment(assignment))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("Group is not part of the assignment.");
      return;
    }
    if (
      !(await group.hasUser(user)) &&
      !(await assignment.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You are not allowed to make a submission");
      return;
    }
    if (
      (await group.hasUser(user)) &&
      (!assignment.isAtState(AssignmentState.SUBMISSION) ||
        (!assignment.lateSubmissions && moment().isAfter(assignment.dueDate)))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "The assignment is not in submission state or the deadline has passed"
        );
      return;
    }
    if (
      (await assignment.isTeacherInCourse(user)) &&
      !(
        assignment.isAtState(AssignmentState.SUBMISSION) ||
        assignment.isAtState(AssignmentState.WAITING_FOR_REVIEW)
      )
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in submission or waitingforreview state");
      return;
    }

    // file info
    const fileExtension = path.extname(req.file.originalname);
    const fileName = path.basename(req.file.originalname, fileExtension);
    const fileHash = null;
    const file = new File(fileName, fileExtension, fileHash);

    let submission: Submission;
    await getManager().transaction(
      "SERIALIZABLE", // serializable is the only way double final submissions can be prevented
      async (transactionalEntityManager) => {
        // unsubmit all previous submissions
        const submissionsOfGroupForAssignment = await transactionalEntityManager.find(
          Submission,
          {
            where: {
              assignment: assignment,
              group: group,
            },
          }
        );
        // Set boolean of submission of older submissions to false
        for (const submissionOfGroupForAssignment of submissionsOfGroupForAssignment) {
          submissionOfGroupForAssignment.final = false;
          await transactionalEntityManager.save(submissionOfGroupForAssignment);
        }

        // save file entry to database
        await transactionalEntityManager.save(file);

        // create submission
        submission = new Submission(user, group, assignment, file, true);
        // this checks for the right extension in the validate function
        await transactionalEntityManager.save(submission);

        // move the file (so if this fails everything above fails)
        // where the file is temporary saved
        const tempPath = req.file.path;
        // new place where the file will be saved
        const filePath = path.resolve(uploadFolder, file.id.toString());
        // move file
        await fsPromises.rename(tempPath, filePath);
      }
    );

    // reload the submission
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await submission!.reload();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(submission!);
  }
);

// Joi inputvalidation
const patchSubmissionSchema = Joi.object({
  final: Joi.boolean().required(),
});
// change final for submission
router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(patchSubmissionSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const submission = await Submission.findOne(req.params.id);
    if (!submission) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send(ResponseMessage.SUBMISSION_NOT_FOUND);
      return;
    }
    const assignment = await submission.getAssignment();
    const group = await submission.getGroup();
    if (
      !(await group.hasUser(user)) &&
      !(await assignment.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You are not allowed to make a submission");
      return;
    }
    if (
      (await group.hasUser(user)) &&
      (!assignment.isAtState(AssignmentState.SUBMISSION) ||
        (!assignment.lateSubmissions && moment().isAfter(assignment.dueDate)))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(
          "The assignment is not in submission state or the deadline has passed"
        );
      return;
    }
    if (
      (await assignment.isTeacherInCourse(user)) &&
      !(
        assignment.isAtState(AssignmentState.SUBMISSION) ||
        assignment.isAtState(AssignmentState.WAITING_FOR_REVIEW)
      )
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in submission or waitingforreview state");
      return;
    }
    // otherwise, perform the patch
    const final = req.body.final;
    // start transaction make sure all submissions are changed at the same time
    await getManager().transaction(
      "SERIALIZABLE", // serializable is the only way double final submissions can be prevented
      async (transactionalEntityManager) => {
        const submissionsOfGroupForAssignment = await transactionalEntityManager.find(
          Submission,
          {
            where: {
              assignment: assignment,
              group: group,
            },
          }
        );
        // set booleans to false for all other assignments
        for (const submissionOfGroupForAssignment of submissionsOfGroupForAssignment) {
          if (submissionOfGroupForAssignment.id !== submission.id) {
            submissionOfGroupForAssignment.final = false;
            await transactionalEntityManager.save(
              submissionOfGroupForAssignment
            );
          }
        }
        // finally set the submission
        submission.final = final;
        await transactionalEntityManager.save(submission);
      }
    );
    await submission.reload();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(submission!);
  }
);

export default router;
