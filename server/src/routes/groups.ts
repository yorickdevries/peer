import express from "express";
import Joi from "@hapi/joi";
import { validateQuery, validateBody } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";
import upload from "../middleware/upload";
import config from "config";
import parseGroupCSV from "../parseGroupCSV";

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
        .status(HttpStatusCode.BAD_REQUEST)
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
    try {
      const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
      console.log(assignment);
      const csvFile = req.file.buffer;
      // still need to be saved
      const groupNameWithNetidLists = await parseGroupCSV(csvFile);
      console.log(groupNameWithNetidLists);
      res.send(groupNameWithNetidLists);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
