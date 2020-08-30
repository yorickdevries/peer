import express from "express";
import Joi from "@hapi/joi";
import { getManager } from "typeorm";
import {
  validateBody,
  validateQuery,
  validateParams,
  idSchema,
} from "../middleware/validation";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import File from "../models/File";
import HttpStatusCode from "../enum/HttpStatusCode";
import upload from "../middleware/upload";
import config from "config";
import hasha from "hasha";
import path from "path";
import fsPromises from "fs/promises";
import _ from "lodash";
import ResponseMessage from "../enum/ResponseMessage";
import Group from "../models/Group";
import { AssignmentState } from "../enum/AssignmentState";
import Extensions from "../enum/Extensions";

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
// get the submissions of a group
router.get(
  "/:id/submissions",
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
      res.status(HttpStatusCode.FORBIDDEN).send("User is part of the group");
      return;
    }
    const submissions = await assignment.getSubmissions(group);
    const sortedSubmissions = _.sortBy(submissions, "id");
    res.send(sortedSubmissions);
  }
);

// get the latest submission of a group
// we should swicth to specific annotation of submissions which indicate whether they are the latest
router.get(
  "/:id/latestsubmission",
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
      res.status(HttpStatusCode.FORBIDDEN).send("User is part of the group");
      return;
    }
    const latestSubmission = await assignment.getLatestSubmission(group);
    if (!latestSubmission) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send("No submissions have been made yet");
      return;
    }
    res.send(latestSubmission);
  }
);

// Joi inputvalidation
const assignmentSchema = Joi.object({
  name: Joi.string().required(),
  courseId: Joi.number().integer().required(),
  reviewsPerUser: Joi.number().integer().required(),
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
  submissionExtensions: Joi.string()
    .valid(...Object.values(Extensions))
    .required(),
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
    if (!(await course.isEnrolled(user, UserRole.TEACHER))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
      return;
    }
    let assignment: Assignment;
    // start transaction make sure the file and assignment are both saved
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // create the file object or leave it as null if no file is uploaded
        let file: File | null = null;
        if (req.file) {
          // file info
          const fileBuffer = req.file.buffer;
          const fileExtension = path.extname(req.file.originalname);
          const fileName = path.basename(req.file.originalname, fileExtension);
          const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
          file = new File(fileName, fileExtension, fileHash);
          await transactionalEntityManager.save(file);
        }
        // create assignment
        assignment = new Assignment(
          req.body.name,
          course,
          req.body.reviewsPerUser,
          req.body.enrollable,
          req.body.reviewEvaluation,
          req.body.publishDate,
          req.body.dueDate,
          req.body.reviewPublishDate,
          req.body.reviewDueDate,
          req.body.reviewEvaluationDueDate,
          req.body.description,
          file, // possibly null
          req.body.externalLink,
          null, // submissionQuestionnaire (initially empty)
          null, // reviewQuestionnaire (initially empty)
          req.body.submissionExtensions
        );
        await transactionalEntityManager.save(assignment);

        // save the file to disk lastly
        // (if this goes wrong all previous steps are rolled back)
        if (file?.id && req.file) {
          const filePath = path.resolve(uploadFolder, file.id.toString());
          await fsPromises.writeFile(filePath, req.file.buffer);
        }
      }
    );
    // reload assignment to get all data
    // assignment should be defined now (else we would be in the catch)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await assignment!.reload();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.send(assignment!);
  }
);

// Joi inputvalidation
const assignmentPatchSchema = Joi.object({
  name: Joi.string().required(),
  reviewsPerUser: Joi.number().integer().required(),
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
  submissionExtensions: Joi.string()
    .valid(...Object.values(Extensions))
    .required(),
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
    // either a new file can be sent or a file can be removed, not both
    if (req.file && req.body.file === null) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("Both a file is uploaded and the body is set to null");
      return;
    }
    // check whether certain fields can be changed
    if (
      assignment.isAtOrAfterState(AssignmentState.REVIEW) &&
      assignment.reviewsPerUser !== req.body.reviewsPerUser
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change reviewsPerUser at this state");
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
    // start transaction make sure the file and assignment are both saved
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        let oldFile: File | null | undefined = undefined;
        // in case a new file is sent or file is set to null, the old one needs to be deleted
        if (req.file || req.body.file === null) {
          oldFile = assignment.file;
        }
        let newFile: File | null | undefined = undefined;
        if (req.body.file === null) {
          newFile = null;
        }
        // create the file object
        if (req.file) {
          // file info
          const fileBuffer = req.file.buffer;
          const fileExtension = path.extname(req.file.originalname);
          const fileName = path.basename(req.file.originalname, fileExtension);
          const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
          newFile = new File(fileName, fileExtension, fileHash);
          await transactionalEntityManager.save(newFile);
        }
        // update assignment fields
        // undefined values will not be changed
        assignment.name = req.body.name;
        assignment.reviewsPerUser = req.body.reviewsPerUser;
        assignment.enrollable = req.body.enrollable;
        assignment.reviewEvaluation = req.body.reviewEvaluation;
        assignment.publishDate = req.body.publishDate;
        assignment.dueDate = req.body.dueDate;
        assignment.reviewPublishDate = req.body.reviewPublishDate;
        assignment.reviewDueDate = req.body.reviewDueDate;
        assignment.reviewEvaluationDueDate = req.body.reviewEvaluationDueDate;
        assignment.description = req.body.description;
        if (newFile !== undefined) {
          assignment.file = newFile;
        }
        assignment.externalLink = req.body.externalLink;
        assignment.submissionExtensions = req.body.submissionExtensions;
        await transactionalEntityManager.save(assignment);

        // save the file to disk
        if (newFile?.id && req.file) {
          const filePath = path.resolve(uploadFolder, newFile.id.toString());
          await fsPromises.writeFile(filePath, req.file.buffer);
        }
        // remove the old file from the disk
        if (oldFile?.id) {
          const filePath = path.resolve(uploadFolder, oldFile.id.toString());
          await fsPromises.unlink(filePath);
          await transactionalEntityManager.remove(oldFile);
        }
      }
    );
    // reload assignment to get all data
    // assignment should be defined now (else we would be in the catch)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await assignment!.reload();
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
  if (!assignment.isAtState(AssignmentState.UNPUBLISHED)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is not in unpublished state");
    return;
  }
  assignment.state = AssignmentState.SUBMISSION;
  await assignment.save();
  res.send(assignment);
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
    if (!assignment.isAtState(AssignmentState.SUBMISSION)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not in submission state");
      return;
    }
    const submissions = await assignment.getLatestSubmissionsOfEachGroup();
    if (submissions.length === 0) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("There are no submissions for this assignment");
      return;
    }
    assignment.state = AssignmentState.WAITING_FOR_REVIEW;
    await assignment.save();
    res.send(assignment);
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
  // save the group in an transaction to make sure no 2 groups are saved at the same time
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // find all groups to check for group existence
      const allGroups = await transactionalEntityManager.find(Group, {
        relations: ["users", "assignments"],
      });
      const alreadyExists = _.some(allGroups, (group) => {
        return (
          _.some(group.users, (groupUser) => {
            return groupUser.netid === user.netid;
          }) &&
          _.some(group.assignments, (groupAssignment) => {
            return groupAssignment.id === assignment.id;
          })
        );
      });
      if (alreadyExists) {
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
