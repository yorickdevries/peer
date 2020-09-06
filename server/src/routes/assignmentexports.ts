import express from "express";
import {
  validateParams,
  idSchema,
  validateQuery,
} from "../middleware/validation";
import AssignmentExport from "../models/AssignmentExport";
import HttpStatusCode from "../enum/HttpStatusCode";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
router.get("/", validateQuery(querySchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentId = req.query.assignmentId as any;
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
  const assignmentExports = await assignment.getAssignmentExports();
  res.send(assignmentExports);
});

router.get("/:id/file", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignmentExport = await AssignmentExport.findOne(req.params.id);
  if (!assignmentExport) {
    res.status(HttpStatusCode.NOT_FOUND).send("assignmentExport not found");
    return;
  }
  const assignment = await assignmentExport.getAssignment();
  if (!(await assignment.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("User is not a teacher of the course");
    return;
  }
  if (!assignmentExport.file) {
    res.status(HttpStatusCode.NOT_FOUND).send("File is not ready yet");
    return;
  }
  const file = assignmentExport.file;
  const fileName = file.getFileNamewithExtension();
  const filePath = file.getPath();
  res.download(filePath, fileName);
});

export default router;
