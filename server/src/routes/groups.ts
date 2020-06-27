import express from "express";
import Joi from "@hapi/joi";
import { validateQuery } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import UserRole from "../enum/UserRole";

const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// get all the groups for an assignment
router.get("/", validateQuery(querySchema), async (req, res) => {
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

export default router;
