import express from "express";
import Joi from "@hapi/joi";
import { validateQuery, validateBody } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";
import upload from "../middleware/upload";
import config from "config";
import parseGroupCSV from "../parseGroupCSV";
import AssignmentState from "../enum/AssignmentState";
import Course from "../models/Course";
import { getManager } from "typeorm";
import User from "../models/User";
import Enrollment from "../models/Enrollment";
import UserRole from "../enum/UserRole";
import Group from "../models/Group";

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
  try {
    const assignment = await Assignment.findOneOrFail(assignmentId);
    if (await assignment.isTeacherOfCourse(user)) {
      // sorting needs to be done
      const groups = await assignment.getGroups();
      const sortedGroups = _.sortBy(groups, "id");
      res.send(sortedGroups);
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

// get the group of a student for this assignment
router.get("/enrolled", validateQuery(assignmentIdSchema), async (req, res) => {
  const assignmentId = req.query.assignmentId as any;
  try {
    const assignment = await Assignment.findOneOrFail(assignmentId);
    const group = await assignment.getGroup(req.user!);
    if (group) {
      res.send(group);
    } else {
      res.status(HttpStatusCode.NOT_FOUND).send("No group found");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

// import groups from a brightspace export
router.post(
  "/import",
  upload([".csv"], maxFileSize, "file"),
  validateBody(assignmentIdSchema),
  async (req, res) => {
    const user = req.user!;
    try {
      const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
      if (await assignment.isTeacherOfCourse(user)) {
        const assignmentState = await assignment.getState();
        if (
          assignmentState === AssignmentState.UNPUBLISHED ||
          assignmentState === AssignmentState.SUBMISSION
        ) {
          if ((await assignment.getGroups()).length !== 0) {
            throw "There already exist groups for this assignment";
          }
          // still need to be saved
          const groupNameWithNetidLists = await parseGroupCSV(req.file.buffer);

          // save the groups in the assignment
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
              if (existingGroups.length !== 0) {
                throw "there already exists groups for this assignment";
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
                  let user = await transactionalEntityManager.findOne(
                    User,
                    netid
                  );
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
                      throw `${netid} is ${UserRole.STUDENT} in this course`;
                    }
                  } else {
                    // enroll the user as student in the course
                    enrollment = new Enrollment(user, course, UserRole.STUDENT);
                    await transactionalEntityManager.save(enrollment);
                  }
                  users.push(user);
                }

                const groupName = groupNameWithNetidList.groupName;
                // make the group self
                const group = new Group(groupName, users, [assignment]);
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
        } else {
          res
            .status(HttpStatusCode.FORBIDDEN)
            .send("The submission state has passed");
        }
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("User is not a teacher of the course");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
