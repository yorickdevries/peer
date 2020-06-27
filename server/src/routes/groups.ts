import express from "express";
import Joi from "@hapi/joi";
import { validateBody, validateQuery } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import UserRole from "../enum/UserRole";
import Group from "../models/Group";
import { getManager } from "typeorm";
import _ from "lodash";

const router = express.Router();

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
    const course = await assignment.getCourse();
    if (await course.isEnrolled(user, UserRole.TEACHER)) {
      res.send(await assignment.getGroups());
    } else {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("user is not a teacher for the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

router.post("/", validateBody(assignmentIdSchema), async (req, res) => {
  const user = req.user!;
  try {
    const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
    if (await assignment.isEnrollable(user)) {
      const group = new Group(user.netid, [user], [assignment]);
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
            throw "Group already exists";
          } else {
            await transactionalEntityManager.save(group);
          }
        }
      );
      // reload the group
      await group.reload();
      res.send(group);
    } else {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Assignment is not enrollable");
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

export default router;
