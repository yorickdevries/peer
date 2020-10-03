import express from "express";
import Joi from "@hapi/joi";
import {
  validateBody,
  validateQuery,
  validateParams,
  idSchema,
} from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";
import upload from "../middleware/upload";
import parseGroupCSV from "../util/parseGroupCSV";
import { AssignmentState } from "../enum/AssignmentState";
import User from "../models/User";
import Enrollment from "../models/Enrollment";
import UserRole from "../enum/UserRole";
import Group from "../models/Group";
import ResponseMessage from "../enum/ResponseMessage";
import fsPromises from "fs/promises";
import {
  startCopyGroupsForAssignmentWorker,
  startImportGroupsForAssignmentWorker,
} from "../workers/pool";

const router = express.Router();

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// get all the groups for an assignment
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
  const groups = await assignment.getGroups();
  const sortedGroups = _.sortBy(groups, "id");
  res.send(sortedGroups);
});

router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const group = await Group.findOne(req.params.id);
  if (!group) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  if (!(await group.isTeacherOrTeachingAssistantInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE);
    return;
  }
  const users = await group.getUsers();
  group.users = users;
  res.send(group);
});

router.delete("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const group = await Group.findOne(req.params.id);
  if (!group) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  if (!(await group.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }

  // TODO: these checks should be done in an transaction
  const assignments = await group.getAssignments();
  for (const assignment of assignments) {
    const assignmentVersions = assignment.versions;
    for (const assignmentVersion of assignmentVersions) {
      const submissions = await assignmentVersion.getSubmissions(group);
      if (submissions.length > 0) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("The group has already made submissions");
        return;
      }
    }
  }
  const users = await group.getUsers();
  if (users.length > 0) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("There are still users in the group");
    return;
  }
  await group.remove();
  res.send(group);
});

// Joi inputvalidation
const userSchema = Joi.object({
  userNetid: Joi.string().required(),
});
router.patch(
  "/:id/adduser",
  validateParams(idSchema),
  validateBody(userSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupId: number = req.params.id as any;
    const group = await Group.findOne(groupId);
    if (!group) {
      res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
      return;
    }
    if (!(await group.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    // NOTE: This should be done in an transaction in the future
    const groupUsers = await group.getUsers();
    const newUserNetid = req.body.userNetid;
    let newUser = await User.findOne(newUserNetid);
    // in case the user doesnt exists in the database yet, create it
    if (!newUser) {
      newUser = new User(newUserNetid);
      await newUser.save();
    }
    if (await group.hasUser(newUser)) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("User is already part of the group");
      return;
    }
    // check whether the user already has a group for one of the assignments
    const groupAssignments = await group.getAssignments();
    for (const assignment of groupAssignments) {
      if (!assignment.isAtOrBeforeState(AssignmentState.SUBMISSION)) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Assignment is already beyond submissionstate");
        return;
      }
      if (await assignment.getGroup(newUser)) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("User is already part of another group in a assignment");
        return;
      }
    }
    // make enrollment if not exists yet
    const course = await group.getCourse();
    // enroll user in the course if not already
    let enrollment = await Enrollment.findOne({
      where: { userNetid: newUser.netid, courseId: course.id },
    });
    if (enrollment) {
      if (enrollment.role !== UserRole.STUDENT) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("The user TA or Teacher in the course");
        return;
      }
    } else {
      // enroll the user as student in the course
      enrollment = new Enrollment(newUser, course, UserRole.STUDENT);
      await enrollment.save();
    }
    groupUsers.push(newUser);
    group.users = groupUsers;
    await group.save();

    // reload the complete group
    const newGroup = await Group.findOne(groupId);
    const newUsers = await group.getUsers();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newGroup!.users = newUsers;
    res.send(newGroup);
  }
);

// Joi inputvalidation
router.patch(
  "/:id/removeuser",
  validateParams(idSchema),
  validateBody(userSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupId: number = req.params.id as any;
    const group = await Group.findOne(groupId);
    if (!group) {
      res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
      return;
    }
    if (!(await group.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    // NOTE: This should be done in an transaction in the future
    const groupUsers = await group.getUsers();
    const removedUserNetid = req.body.userNetid;
    const removedUser = await User.findOne(removedUserNetid);
    if (!removedUser) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.USER_NOT_FOUND);
      return;
    }
    if (!(await group.hasUser(removedUser))) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("User is not part of the group");
      return;
    }
    // check whether the assignments are still in submissionstate
    const groupAssignments = await group.getAssignments();
    for (const assignment of groupAssignments) {
      const submissions = await assignment.getSubmissions();
      if (
        _.some(submissions, (submission) => {
          return submission.userNetid === removedUser.netid;
        })
      ) {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("User has already made a submission for the assignment");
        return;
      }
      if (!assignment.isAtOrBeforeState(AssignmentState.SUBMISSION)) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Assignment is already beyond submissionstate");
        return;
      }
    }
    // if all is ok, the user can be removed
    _.remove(groupUsers, (groupUser) => {
      return groupUser.netid === removedUser.netid;
    });
    group.users = groupUsers;
    await group.save();

    // reload the complete group
    const newGroup = await Group.findOne(groupId);
    const newUsers = await group.getUsers();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newGroup!.users = newUsers;
    res.send(newGroup);
  }
);

// 1 MB
const maxFileSize = 1048576;

// import groups from a brightspace export
router.post(
  "/import",
  upload([".csv"], maxFileSize, "file"),
  validateBody(assignmentIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    if (!req.file) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("File is needed for the import");
      return;
    }

    interface groupNameWithNetidList {
      groupName: string;
      netids: string[];
    }

    let groupNameWithNetidLists: groupNameWithNetidList[];
    try {
      // read file and remove file
      const fileBuffer = await fsPromises.readFile(req.file.path);
      await fsPromises.unlink(req.file.path);
      // can throw an error if malformed
      groupNameWithNetidLists = await parseGroupCSV(fileBuffer);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
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
      // not a teacher
      !(await assignment.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    if (!assignment.isAtOrBeforeState(AssignmentState.SUBMISSION)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The submission state has passed");
      return;
    }
    if (await assignment.hasGroups()) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("There are already groups for this assignment");
      return;
    }

    // offload a function to a worker
    startImportGroupsForAssignmentWorker(
      assignment.id,
      groupNameWithNetidLists
    );

    // send message that groups are being made
    res.send();
  }
);

// Joi inputvalidation for query
const groupSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  name: Joi.string().required(),
});
// create a group for this assignment
router.post("/", validateBody(groupSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignment = await Assignment.findOne(req.body.assignmentId);
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
  if (!assignment.isAtOrBeforeState(AssignmentState.SUBMISSION)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The submission state has passed");
    return;
  }
  const course = await assignment.getCourse();
  const group = new Group(req.body.name, course, [], [assignment]);
  await group.save();
  res.send(group);
});

const copyFromAssignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  copyFromAssignmentId: Joi.number().integer().required(),
});
// copy groups from another assignment
router.post(
  "/copy",
  validateBody(copyFromAssignmentIdSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignment = await Assignment.findOne(req.body.assignmentId);
    const copyFromAssignment = await Assignment.findOne(
      req.body.copyFromAssignmentId
    );
    if (!assignment || !copyFromAssignment) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }
    if (assignment.id === copyFromAssignment.id) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Two distinct assignments are required");
      return;
    }
    if (
      // not a teacher
      !(await assignment.isTeacherInCourse(user)) ||
      !(await copyFromAssignment.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
      return;
    }
    const course = await assignment.getCourse();
    const copyFromAssignmentCourse = await copyFromAssignment.getCourse();
    if (course.id !== copyFromAssignmentCourse.id) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("Both assignments should be from the same course");
      return;
    }
    if (!assignment.isAtOrBeforeState(AssignmentState.SUBMISSION)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The submission state has passed");
      return;
    }
    if (await assignment.hasGroups()) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("There are already groups for this assignment");
      return;
    }

    // offload a function to a worker
    startCopyGroupsForAssignmentWorker(assignment.id, copyFromAssignment.id);

    // send message that groups are being made
    res.send();
  }
);

export default router;
