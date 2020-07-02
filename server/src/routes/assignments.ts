import express from "express";
import Joi from "@hapi/joi";
import { getManager } from "typeorm";
import {
  validateBody,
  validateQuery,
  validateParams,
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
import AssignmentState from "../enum/AssignmentState";

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
  const user = req.user!;
  // this value has been parsed by the validate function
  const courseId = req.query.courseId as any;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  if (!(await course.isEnrolled(user, UserRole.TEACHER))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  const allAssignments = await course.getAssignments();
  const sortedAllAssignments = _.sortBy(allAssignments, "id");
  res.send(sortedAllAssignments);
});

// get an assignment by id
// Joi inputvalidation
const idSchema = Joi.object({
  id: Joi.number().integer().required(),
});
router.get("/:id", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const assignment = await Assignment.findOne(req.params.id);
  if (!assignment) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignment.isTeacherInCourse(user)) &&
    !(
      // not published yet
      (
        (await assignment.isEnrolledInGroup(user)) &&
        !((await assignment.getState()) === AssignmentState.UNPUBLISHED)
      )
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
  const user = req.user!;
  const assignment = await Assignment.findOne(req.params.id);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignment.isTeacherInCourse(user)) &&
    !(
      // not published yet
      (
        (await assignment.isEnrolledInGroup(user)) &&
        !((await assignment.getState()) === AssignmentState.UNPUBLISHED)
      )
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
  const fileName = file.name + file.extension;
  const filePath = path.resolve(uploadFolder, file.id.toString());
  res.download(filePath, fileName);
});

// get the group by assignment id
router.get("/:id/group", validateParams(idSchema), async (req, res) => {
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
  const users = _.map(groupUsers, (user) =>
    _.pick(user, ["netid", "displayName", "email"])
  );
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
    const user = req.user!;
    const assignmentId = req.params.id;
    const groupId = req.query.groupId as any;
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

// get the submissions of a group
router.get(
  "/:id/latestsubmission",
  validateParams(idSchema),
  validateQuery(querySubmissionSchema),
  async (req, res) => {
    const user = req.user!;
    const assignmentId = req.params.id;
    const groupId = req.query.groupId as any;
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
    // all submissions of group
    const submissions = await assignment.getSubmissions(group);
    const latestSubmission = _.maxBy(submissions, "id");
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
  externalLink: Joi.string().allow(null).required(),
});
// post an assignment in a course
router.post(
  "/",
  upload(allowedExtensions, maxFileSize, "file"),
  validateBody(assignmentSchema),
  async (req, res) => {
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
          null // reviewQuestionnaire (initially empty)
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
    await assignment!.reload();
    res.send(assignment!);
  }
);

router.post("/:id/enroll", validateParams(idSchema), async (req, res) => {
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
