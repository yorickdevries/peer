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
import config from "config";
import parseGroupCSV from "../util/parseGroupCSV";
import { AssignmentState } from "../enum/AssignmentState";
import Course from "../models/Course";
import { getManager } from "typeorm";
import User from "../models/User";
import Enrollment from "../models/Enrollment";
import UserRole from "../enum/UserRole";
import Group from "../models/Group";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

const maxFileSize = config.get("maxFileSize") as number;

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// get all the groups for an assignment
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
  const groups = await assignment.getGroups();
  const sortedGroups = _.sortBy(groups, "id");
  res.send(sortedGroups);
});

router.get("/:id", validateParams(idSchema), async (req, res) => {
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
  const users = await group.getUsers();
  group.users = users;
  res.send(group);
});

// import groups from a brightspace export
router.post(
  "/import",
  upload([".csv"], maxFileSize, "file"),
  validateBody(assignmentIdSchema),
  async (req, res) => {
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
    const assignmentState = await assignment.getState();
    if (
      !(
        assignmentState === AssignmentState.UNPUBLISHED ||
        assignmentState === AssignmentState.SUBMISSION
      )
    ) {
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
    // still need to be saved
    interface groupNameWithNetidList {
      groupName: string;
      netids: string[];
    }
    let groupNameWithNetidLists: groupNameWithNetidList[];
    try {
      // can throw an error if malformed
      groupNameWithNetidLists = await parseGroupCSV(req.file.buffer);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
      return;
    }
    // save the users and enroll them in the course
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        const course = await transactionalEntityManager.findOneOrFail(
          Course,
          assignment.courseId
        );

        // iterate over all groups
        for (const groupNameWithNetidList of groupNameWithNetidLists) {
          const netids = groupNameWithNetidList.netids;
          // get or make users
          for (const netid of netids) {
            let user = await transactionalEntityManager.findOne(User, netid);
            // in case the user doesnt exists in the database yet, create it
            if (!user) {
              user = new User(netid);
              await transactionalEntityManager.save(user);
            }
            // enroll user in the course if not already
            let enrollment = await transactionalEntityManager.findOne(
              Enrollment,
              { where: { userNetid: user.netid, courseId: course.id } }
            );

            if (enrollment) {
              if (enrollment.role !== UserRole.STUDENT) {
                throw new Error(
                  `${netid} is ${enrollment.role} in this course`
                );
              }
            } else {
              // enroll the user as student in the course
              enrollment = new Enrollment(user, course, UserRole.STUDENT);
              await transactionalEntityManager.save(enrollment);
            }
          }
        }
      }
    );
    // save the users of the groups in the course
    const groups: Group[] = [];
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        const existingGroups = (
          await transactionalEntityManager.findOneOrFail(
            Assignment,
            assignment.id,
            {
              relations: ["groups"],
            }
          )
        ).groups!;
        if (existingGroups.length > 0) {
          throw new Error("There are already groups for this assignment");
        }

        const course = await transactionalEntityManager.findOneOrFail(
          Course,
          assignment.courseId
        );

        // iterate over all groups
        for (const groupNameWithNetidList of groupNameWithNetidLists) {
          const netids = groupNameWithNetidList.netids;
          // get or make users
          const users = [];
          for (const netid of netids) {
            const user = await transactionalEntityManager.findOneOrFail(
              User,
              netid
            );
            users.push(user);
          }

          const groupName = groupNameWithNetidList.groupName;
          // make the group
          const group = new Group(groupName, course, users, [assignment]);
          await transactionalEntityManager.save(group);
          groups.push(group);
        }
      }
    );
    // reload the groups from the database
    for (const group of groups) {
      await group.reload();
    }
    res.send(groups);
  }
);

// Joi inputvalidation for query
const groupSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  name: Joi.string().required(),
});
// create a group for this assignment
router.post("/", validateBody(groupSchema), async (req, res) => {
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
  const assignmentState = await assignment.getState();
  if (
    !(
      assignmentState === AssignmentState.UNPUBLISHED ||
      assignmentState === AssignmentState.SUBMISSION
    )
  ) {
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

export default router;
