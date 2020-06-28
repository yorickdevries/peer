import express from "express";
import Joi from "@hapi/joi";
import { validateQuery } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import UserRole from "../enum/UserRole";
import Group from "../models/Group";

const router = express.Router();

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// get all the submissions for an assignment
router.get("/", validateQuery(assignmentIdSchema), async (req, res) => {
  const user = req.user!;
  const assignmentId = req.query.assignmentId as any;
  try {
    const assignment = await Assignment.findOneOrFail(assignmentId);
    const course = await assignment.getCourse();
    if (await course.isEnrolled(user, UserRole.TEACHER)) {
      res.send(await assignment.getSubmissions());
    } else {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("User is not a teacher for the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

// Joi inputvalidation for query
const querySubmissionSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  groupId: Joi.number().integer().required(),
});
// get the submissions of a group
router.get(
  "/enrolled",
  validateQuery(querySubmissionSchema),
  async (req, res) => {
    const user = req.user!;
    const assignmentId = req.query.assignmentId as any;
    const groupId = req.query.groupId as any;
    try {
      const assignment = await Assignment.findOneOrFail(assignmentId);
      const group = await Group.findOneOrFail(groupId);
      if (await group.hasUser(user)) {
        res.send(await assignment.getSubmissions(group));
      } else {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("User is part of the group");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
