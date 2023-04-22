import express from "express";
import Joi, { CustomHelpers } from "joi";
import { getManager } from "typeorm";
import {
  idSchema,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import File from "../models/File";
import HttpStatusCode from "../enum/HttpStatusCode";
import upload from "../middleware/upload";
import config from "config";
import path from "path";
import fsPromises from "fs/promises";
import _ from "lodash";
import ResponseMessage from "../enum/ResponseMessage";
import Group from "../models/Group";
import { AssignmentState } from "../enum/AssignmentState";
import AssignmentType from "../enum/AssignmentType";
import Submission from "../models/Submission";
import publishAssignment from "../assignmentProgression/publishAssignment";
import closeSubmission from "../assignmentProgression/closeSubmission";
import { scheduleJobsForAssignment } from "../assignmentProgression/scheduler";

const router = express.Router();

// config values
const uploadFolder = config.get("uploadFolder") as string;
const allowedExtensions = config.get("allowedExtensions") as string[];
const maxFileSize = config.get("maxFileSize") as number;

// Joi inputvalidation
const queryCourseIdSchema = Joi.object({
  courseId: Joi.number().integer().required(),
});
// get all all assignments (for teacher) for specific course
router.get("/", validateQuery(queryCourseIdSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseId: number = req.query.courseId as any;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  if (!(await course.isTeacherOrTeachingAssistant(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
    return;
  }
  const allAssignments = await course.getAssignments();
  const sortedAllAssignments = _.sortBy(allAssignments, "id");
  res.send(sortedAllAssignments);
});

router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignment = await Assignment.findOne(req.params.id);
  if (!assignment) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    (await assignment.isEnrolledInGroup(user)) &&
    (await assignment.isAtState(AssignmentState.UNPUBLISHED))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("This assignment is not published yet");
    return;
  }
  if (
    !(
      (await assignment.isTeacherOrTeachingAssistantInCourse(user)) ||
      (await assignment.isEnrolledInGroup(user))
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view this assignment");
    return;
  }
  res.send(assignment);
});

// get an assignment file by assignment id
router.get("/:id/file", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignment = await Assignment.findOne(req.params.id);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    (await assignment.isEnrolledInGroup(user)) &&
    (await assignment.isAtState(AssignmentState.UNPUBLISHED))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("This assignment is not published yet");
    return;
  }
  if (
    !(
      (await assignment.isTeacherOrTeachingAssistantInCourse(user)) ||
      (await assignment.isEnrolledInGroup(user))
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view this assignment");
    return;
  }
  // get the file
  const file = assignment.file;
  if (!file) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send("This assignment does not have a file attached.");
    return;
  }
  const fileName = file.getFileNamewithExtension();
  const filePath = file.getPath();
  res.download(filePath, fileName);
});

// get the group by assignment id
router.get("/:id/group", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignment = await Assignment.findOne(req.params.id);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  const group = await assignment.getGroup(user);
  if (!group) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.GROUP_NOT_FOUND);
    return;
  }
  const groupUsers = await group.getUsers();
  // remove the sensitive info
  const users = _.map(groupUsers, (user) => {
    return _.pick(user, ["netid", "displayName", "email"]);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  group.users = users as any;
  res.send(group);
});

// Joi inputvalidation for query
const querySubmissionSchema = Joi.object({
  groupId: Joi.number().integer().required(),
});

// get the submission which will be used for reviewing of a group
router.get(
  "/:id/finalsubmission",
  validateParams(idSchema),
  validateQuery(querySubmissionSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignmentId = req.params.id;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupId: number = req.query.groupId as any;
    const assignment = await Assignment.findOne(assignmentId);
    if (!assignment) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }
    const group = await Group.findOne(groupId);
    if (!group) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.GROUP_NOT_FOUND);
      return;
    }
    if (!(await group.hasUser(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not part of the group");
      return;
    }
    const finalSubmissions: Submission[] = [];
    for (const assignmentVersion of assignment.versions) {
      const finalSubmission = await assignmentVersion.getFinalSubmission(group);
      if (finalSubmission) {
        finalSubmissions.push(finalSubmission);
      }
    }
    if (finalSubmissions.length === 0) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send("No submissions have been made yet");
      return;
    }
    if (finalSubmissions.length === 1) {
      res.send(finalSubmissions[0]);
    } else {
      throw new Error("There are multiple finalSubmissions");
    }
  }
);

const extensionValidation = (value: string, helpers: CustomHelpers) => {
  const extensions = value.split(/\s*,\s*/);
  // Remove empty extension belonging to trailing comma
  if (extensions.length > 1 && extensions[extensions.length - 1].length == 0) {
    extensions.pop();
  }

  for (const extension of extensions) {
    // Match file extensions starting with . followed by 1 or more alphabetic characters or a star
    if (!/^\.([A-Za-z]+|\*)$/.test(extension)) {
      return helpers.error("any.invalid");
    }
  }

  return value;
};

// Joi inputvalidation
const assignmentSchema = Joi.object({
  name: Joi.string().required(),
  courseId: Joi.number().integer().required(),
  enrollable: Joi.boolean().required(),
  reviewEvaluation: Joi.boolean().required(),
  publishDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  reviewPublishDate: Joi.date().required(),
  reviewDueDate: Joi.date().required(),
  reviewEvaluationDueDate: Joi.date().allow(null).required(),
  description: Joi.string().allow(null).required(),
  file: Joi.allow(null),
  externalLink: Joi.string().allow(null).required(),
  submissionExtensions: Joi.string().custom(extensionValidation).required(),
  blockFeedback: Joi.boolean().required(),
  lateSubmissions: Joi.boolean().required(),
  lateSubmissionReviews: Joi.boolean().required(),
  lateReviewEvaluations: Joi.boolean().allow(null).required(),
  automaticStateProgression: Joi.boolean().required(),
  assignmentType: Joi.string()
    .valid(...Object.values(AssignmentType))
    .required(),
  sendNotificationEmails: Joi.boolean().required(),
});
// post an assignment in a course
router.post(
  "/",
  upload(allowedExtensions, maxFileSize, "file"),
  validateBody(assignmentSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const course = await Course.findOne(req.body.courseId);
    if (!course) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(`Course with id ${req.body.courseId} does not exist`);
      return;
    }
    if (!(await course.isTeacher(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
      return;
    }

    // create asignment and validate
    const assignment = new Assignment(
      req.body.name,
      course,
      req.body.enrollable,
      req.body.reviewEvaluation,
      req.body.publishDate,
      req.body.dueDate,
      req.body.reviewPublishDate,
      req.body.reviewDueDate,
      req.body.reviewEvaluationDueDate,
      req.body.description,
      null, // file, will be set later
      req.body.externalLink,
      req.body.submissionExtensions,
      req.body.blockFeedback,
      req.body.lateSubmissions,
      req.body.lateSubmissionReviews,
      req.body.lateReviewEvaluations,
      req.body.automaticStateProgression,
      req.body.assignmentType,
      req.body.sendNotificationEmails
    );

    // construct file to be saved in transaction
    // create the file object or leave it as null if no file is uploaded
    let file: File | null = null;
    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      const fileName = path.basename(req.file.originalname, fileExtension);
      const fileHash = null;
      file = new File(fileName, fileExtension, fileHash);
    }

    // start transaction make sure the file and assignment are both saved
    await getManager().transaction(
      "READ COMMITTED",
      async (transactionalEntityManager) => {
        if (file) {
          // save file entry to database
          await file.validateOrReject();
          await transactionalEntityManager.save(file);
          // set file as field of assignment
          assignment.file = file;
        }
        await assignment.validateOrReject();
        await transactionalEntityManager.save(assignment);

        if (file) {
          // move the file (so if this fails everything above fails)
          // where the file is temporary saved
          const tempPath = req.file.path;
          // new place where the file will be saved
          const filePath = path.resolve(uploadFolder, file.id.toString());
          // move file
          await fsPromises.rename(tempPath, filePath);
        }
      }
    );

    // reload the assignment
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await assignment!.reload();
    // schedule automated tasks
    scheduleJobsForAssignment(assignment);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(assignment!);
  }
);

// Joi inputvalidation
const assignmentPatchSchema = Joi.object({
  name: Joi.string().required(),
  enrollable: Joi.boolean().required(),
  reviewEvaluation: Joi.boolean().required(),
  publishDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  reviewPublishDate: Joi.date().required(),
  reviewDueDate: Joi.date().required(),
  reviewEvaluationDueDate: Joi.date().allow(null).required(),
  description: Joi.string().allow(null).required(),
  file: Joi.allow(null),
  externalLink: Joi.string().allow(null).required(),
  submissionExtensions: Joi.string().custom(extensionValidation).required(),
  blockFeedback: Joi.boolean().required(),
  lateSubmissions: Joi.boolean().required(),
  lateSubmissionReviews: Joi.boolean().required(),
  lateReviewEvaluations: Joi.boolean().allow(null).required(),
  automaticStateProgression: Joi.boolean().required(),
  assignmentType: Joi.string()
    .valid(...Object.values(AssignmentType))
    .required(),
  sendNotificationEmails: Joi.boolean().required(),
});
// patch an assignment in a course
router.patch(
  "/:id",
  upload(allowedExtensions, maxFileSize, "file"),
  validateParams(idSchema),
  validateBody(assignmentPatchSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignmentId = req.params.id;
    let assignment = await Assignment.findOne(assignmentId);
    if (!assignment) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }
    if (!(await assignment.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
      return;
    }
    if (
      !assignment.isAtOrBeforeState(AssignmentState.SUBMISSION) &&
      assignment.enrollable !== req.body.enrollable
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change enrollable at this state");
      return;
    }
    if (
      !assignment.isAtOrBeforeState(AssignmentState.SUBMISSION) &&
      assignment.lateSubmissions !== req.body.lateSubmissions
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change lateSubmissions at this state");
      return;
    }
    if (
      assignment.isAtOrAfterState(AssignmentState.FEEDBACK) &&
      assignment.reviewEvaluation !== req.body.reviewEvaluation
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change reviewEvaluation at this state");
      return;
    }
    if (
      !assignment.isAtState(AssignmentState.UNPUBLISHED) &&
      assignment.submissionExtensions !== req.body.submissionExtensions
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change submissionExtensions at this state");
      return;
    }
    if (
      !assignment.isAtState(AssignmentState.UNPUBLISHED) &&
      assignment.assignmentType !== req.body.assignmentType
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change assignmentType at this state");
      return;
    }
    // either a new file can be sent or a file can be removed, not both
    if (req.file && req.body.file === null) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("Both a file is uploaded and the body is set to null");
      return;
    }
    // construct file variables
    let newFile: File | null | undefined;
    if (req.body.file === null) {
      newFile = null;
    }
    if (req.file) {
      // file info
      const fileExtension = path.extname(req.file.originalname);
      const fileName = path.basename(req.file.originalname, fileExtension);
      const fileHash = null;
      newFile = new File(fileName, fileExtension, fileHash);
    }

    // save old existing file
    let oldFile: File | null | undefined;

    // start transaction make sure the file and assignment are both saved
    await getManager().transaction(
      "REPEATABLE READ",
      async (transactionalEntityManager) => {
        // fetch assignment form database
        assignment = await transactionalEntityManager.findOneOrFail(
          Assignment,
          assignmentId
        );
        // in case a new file is sent or file is set to null, the old one needs to be deleted
        if (newFile || req.body.file === null) {
          oldFile = assignment.file;
        }

        // update assignment fields
        assignment.name = req.body.name;
        assignment.enrollable = req.body.enrollable;
        assignment.reviewEvaluation = req.body.reviewEvaluation;
        assignment.publishDate = req.body.publishDate;
        assignment.dueDate = req.body.dueDate;
        assignment.reviewPublishDate = req.body.reviewPublishDate;
        assignment.reviewDueDate = req.body.reviewDueDate;
        assignment.reviewEvaluationDueDate = req.body.reviewEvaluationDueDate;
        assignment.description = req.body.description;
        assignment.externalLink = req.body.externalLink;
        assignment.submissionExtensions = req.body.submissionExtensions;
        assignment.blockFeedback = req.body.blockFeedback;
        assignment.lateSubmissions = req.body.lateSubmissions;
        assignment.lateSubmissionReviews = req.body.lateSubmissionReviews;
        assignment.lateReviewEvaluations = req.body.lateReviewEvaluations;
        assignment.automaticStateProgression =
          req.body.automaticStateProgression;
        assignment.assignmentType = req.body.assignmentType;
        assignment.sendNotificationEmails = req.body.sendNotificationEmails;

        // change the file in case it is not undefined
        if (newFile !== undefined) {
          if (newFile) {
            // save file entry to database
            await newFile.validateOrReject();
            await transactionalEntityManager.save(newFile);
          }
          // set file as field of assignment
          assignment.file = newFile;
        }
        await assignment.validateOrReject();
        await transactionalEntityManager.save(assignment);

        if (newFile) {
          // move the file (so if this fails everything above fails)
          // where the file is temporary saved
          const tempPath = req.file.path;
          // new place where the file will be saved
          const filePath = path.resolve(uploadFolder, newFile.id.toString());
          // move file
          await fsPromises.rename(tempPath, filePath);
        }
      }
    );

    // remove the old file from the disk
    if (oldFile) {
      const oldId = oldFile.id;
      await oldFile.remove();
      const filePath = path.resolve(uploadFolder, oldId.toString());
      await fsPromises.unlink(filePath);
    }

    // reload the assignment
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await assignment!.reload();
    // reschedule automated tasks
    scheduleJobsForAssignment(assignment);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(assignment!);
  }
);

// publish an assignment from unpublished state
router.patch("/:id/publish", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignmentId = req.params.id;
  const assignment = await Assignment.findOne(assignmentId);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (!(await assignment.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("User is not a teacher of the course");
    return;
  }
  try {
    const result = await publishAssignment(assignment.id);
    res.send(result);
    return;
  } catch (error) {
    res.status(HttpStatusCode.FORBIDDEN).send(String(error));
    return;
  }
});

// close an assignment from submission state
router.patch(
  "/:id/closesubmission",
  validateParams(idSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignmentId = req.params.id;
    const assignment = await Assignment.findOne(assignmentId);
    if (!assignment) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }
    if (!(await assignment.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
      return;
    }
    try {
      const result = await closeSubmission(assignment.id);
      res.send(result);
      return;
    } catch (error) {
      res.status(HttpStatusCode.FORBIDDEN).send(String(error));
      return;
    }
  }
);

router.post("/:id/enroll", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignment = await Assignment.findOne(req.params.id);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (!(await assignment.isEnrollable(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is not enrollable");
    return;
  }
  const course = await assignment.getCourse();
  const group = new Group(user.netid, course, [user], [assignment]);
  // validate outside transaction as it otherwise might block the transaction
  await group.validateOrReject();
  // save the group in an transaction to make sure no 2 groups are saved at the same time
  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way double groups can be prevented
    async (transactionalEntityManager) => {
      // get group
      const existingGroup = await transactionalEntityManager
        .createQueryBuilder(Group, "group")
        .leftJoin("group.assignments", "assignment")
        .leftJoin("group.users", "user")
        .where("assignment.id = :id", { id: assignment.id })
        .andWhere("user.netid = :netid", { netid: user.netid })
        .getOne();
      if (existingGroup) {
        // throw error if a group already exists
        // Can happen if 2 concurrent calls are made
        throw new Error("Group already exists");
      } else {
        await transactionalEntityManager.save(group);
      }
    }
  );
  // reload the group
  await group.reload();
  res.send(group);
});

export default router;
