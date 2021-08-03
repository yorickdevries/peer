import express from "express";
import Joi from "@hapi/joi";
import {
  validateQuery,
  validateBody,
  idSchema,
  validateParams,
} from "../middleware/validation";
import AssignmentVersion from "../models/AssignmentVersion";
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
import removePDFMetadata from "../util/removePDFMetadata";
import AssignmentExport from "../models/AssignmentExport";
import {
  startExportSubmissionsForAssignmentVersionWorker,
  startSubmissionFlaggingWorker,
  startImportWebLabSubmissionsWorker,
} from "../workers/pool";
import AssignmentType from "../enum/AssignmentType";

// config values
const uploadFolder = config.get("uploadFolder") as string;
const maxFileSize = config.get("maxFileSize") as number;

const router = express.Router();

// Joi inputvalidation for query
const assignmentVersionIdSchema = Joi.object({
  assignmentVersionId: Joi.number().integer().required(),
});
// get all the submissions for an assignment
router.get("/", validateQuery(assignmentVersionIdSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentVersionId: number = req.query.assignmentVersionId as any;
  const assignmentVersion = await AssignmentVersion.findOne(
    assignmentVersionId
  );
  if (!assignmentVersion) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignmentVersion.isTeacherOrTeachingAssistantInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
    return;
  }
  const submissions = await assignmentVersion.getSubmissions();
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
  const assignmentVersion = await submission.getAssignmentVersion();
  if (
    !(
      (await group.hasUser(user)) ||
      (await assignmentVersion.isTeacherOrTeachingAssistantInCourse(user))
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
  const assignmentVersion = await submission.getAssignmentVersion();
  if (
    !(
      (await group.hasUser(user)) ||
      (await assignmentVersion.isTeacherOrTeachingAssistantInCourse(user))
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
  const assignmentVersion = await submission.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (!assignment.isAtState(AssignmentState.FEEDBACK)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view reviews");
    return;
  }
  const submissionQuestionnaire = await assignmentVersion.getSubmissionQuestionnaire();
  if (!submissionQuestionnaire) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("No submissionquestionnaire is defined");
    return;
  }
  if (
    assignment.blockFeedback &&
    (await assignment.hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(user))
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
  assignmentVersionId: Joi.number().integer().required(),
});
// post a submission in a course
router.post(
  "/",
  upload([".*"], maxFileSize, "file"),
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
    const assignmentVersion = await AssignmentVersion.findOne(
      req.body.assignmentVersionId
    );
    if (!assignmentVersion) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
      return;
    }
    const assignment = await assignmentVersion.getAssignment();
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

    const submissionExtensions = assignment.submissionExtensions.split(
      /\s*,\s*/
    );
    if (
      !submissionExtensions.includes(fileExtension) &&
      !submissionExtensions.includes(".*")
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(`Extension not allowed: ${fileExtension}`);
      return;
    }
    const fileName = path.basename(req.file.originalname, fileExtension);
    // run removePDFMetadata in case the file is a pdf
    if (fileExtension === ".pdf") {
      await removePDFMetadata(req.file.path);
    }
    const fileHash = null;
    const file = new File(fileName, fileExtension, fileHash);

    // create submission
    const submission = new Submission(
      user,
      group,
      assignmentVersion,
      file,
      true
    );
    // this checks for the right extension in the validate function
    await submission.validateOrReject();
    await getManager().transaction(
      "SERIALIZABLE", // serializable is the only way double final submissions can be prevented
      async (transactionalEntityManager) => {
        for (const assignmentVersion of assignment.versions) {
          // unsubmit all previous submissions
          const submissionsOfGroupForAssignment = await transactionalEntityManager.find(
            Submission,
            {
              where: {
                assignmentVersion: assignmentVersion,
                group: group,
              },
            }
          );
          // Set boolean of submission of older submissions to false
          for (const submissionOfGroupForAssignment of submissionsOfGroupForAssignment) {
            submissionOfGroupForAssignment.final = false;
            // do not validate as this might block transaction
            //await submissionOfGroupForAssignment.validateOrReject();
            await transactionalEntityManager.save(
              submissionOfGroupForAssignment
            );
          }
        }

        // save file entry to database
        await file.validateOrReject();
        await transactionalEntityManager.save(file);

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    startSubmissionFlaggingWorker(submission!.id);
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
    const assignmentVersion = await submission.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
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
    // finally set the submission
    submission.final = final;
    await submission.validateOrReject();

    // start transaction make sure all submissions are changed at the same time
    await getManager().transaction(
      "SERIALIZABLE", // serializable is the only way double final submissions can be prevented
      async (transactionalEntityManager) => {
        for (const assignmentVersion of assignment.versions) {
          const submissionsOfGroupForAssignment = await transactionalEntityManager.find(
            Submission,
            {
              where: {
                assignmentVersion: assignmentVersion,
                group: group,
              },
            }
          );
          // set booleans to false for all other assignments
          for (const submissionOfGroupForAssignment of submissionsOfGroupForAssignment) {
            if (submissionOfGroupForAssignment.id !== submission.id) {
              submissionOfGroupForAssignment.final = false;
              // do not validate as this might block transaction
              // await submissionOfGroupForAssignment.validateOrReject();
              await transactionalEntityManager.save(
                submissionOfGroupForAssignment
              );
            }
          }
        }
        await transactionalEntityManager.save(submission);
      }
    );
    await submission.reload();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(submission!);
  }
);

const submissionApprovalSchema = Joi.object({
  approvalByTA: Joi.boolean().required(),
  commentByTA: Joi.string().allow(null).required(),
});
// change a review approval
router.patch(
  "/:id/approval",
  validateParams(idSchema),
  validateBody(submissionApprovalSchema),
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
    if (!(await submission.isTeacherOrTeachingAssistantInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
      return;
    }
    if (
      submission.approvingTA !== null &&
      submission.approvingTA.netid !== user.netid
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The submission has already been evaluated by another TA");
      return;
    }
    // set new values
    submission.approvalByTA = req.body.approvalByTA;
    submission.commentByTA = req.body.commentByTA;
    submission.approvingTA = user;
    await submission.save();
    res.send(submission);
    return;
  }
);

// Joi inputvalidation for query
const assignmentExportIdSchema = Joi.object({
  assignmentVersionId: Joi.number().integer().required(),
  exportType: Joi.string().valid("csv", "xls"),
});
router.post(
  "/export",
  validateQuery(assignmentExportIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignmentVersionId: number = req.query.assignmentVersionId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportType: "csv" | "xls" = req.query.exportType as any;
    const assignmentVersion = await AssignmentVersion.findOne(
      assignmentVersionId
    );
    if (!assignmentVersion) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
      return;
    }
    if (
      // not a teacher
      !(await assignmentVersion.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    // make sure there is something to export
    const submissions = await assignmentVersion.getSubmissions();
    if (submissions.length == 0) {
      res.status(HttpStatusCode.BAD_REQUEST);
      res.send("Nothing to export.");
      return;
    }
    // make export entry without file
    const assignment = await assignmentVersion.getAssignment();
    const assignmentExport = new AssignmentExport(user, assignment, null);
    await assignmentExport.save();

    // offload a function to a worker
    startExportSubmissionsForAssignmentVersionWorker(
      assignmentVersion.id,
      assignmentExport.id,
      exportType
    );

    // send message that reviews are being exported
    res.send(assignmentExport);
  }
);

router.post(
  "/import",
  upload([".zip"], maxFileSize, "file"),
  validateBody(assignmentVersionIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    if (!req.file) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("File is needed for the import");
      return;
    }

    const assignmentVersion = await AssignmentVersion.findOne(
      req.body.assignmentVersionId
    );
    if (!assignmentVersion) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
      return;
    }
    if (
      // not a teacher
      !(await assignmentVersion.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    const assignment = await assignmentVersion.getAssignment();
    if (assignment.assignmentType !== AssignmentType.CODE) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(`The assignment must be a '${AssignmentType.CODE}' assignment`);
      return;
    }
    if (assignment.enrollable) {
      res.status(HttpStatusCode.FORBIDDEN).send("The assignment is enrollable");
      return;
    }
    if (!assignment.isAtOrBeforeState(AssignmentState.SUBMISSION)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The submission state has passed");
      return;
    }
    if (!/\.zip($|[\s,])/.test(assignment.submissionExtensions)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment must allow .zip submissions");
      return;
    }
    const groups = await assignment.getGroups();
    if (groups.length > 0) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("There are already groups for this assignment");
      return;
    }
    const submissions = await assignmentVersion.getSubmissions();
    if (submissions.length > 0) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("There are already submissions for this assignment");
      return;
    }

    // offload a function to a worker
    startImportWebLabSubmissionsWorker(assignmentVersion.id, req.file);

    // send message that submissions are being imported
    res.send();
  }
);

export default router;
