import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";

const router = express.Router();

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
  filename: Joi.string().allow(null).required(),
  externalLink: Joi.string().allow(null).required(),
});
// post an assignment in a course
// needs to be checked whether the user is employee
router.post("/", validateBody(assignmentSchema), async (req, res) => {
  try {
    const assignment = new Assignment(
      req.body.name,
      req.body.courseId,
      req.body.reviewsPerUser,
      req.body.enrollable,
      req.body.reviewEvaluation,
      new Date(req.body.publishDate),
      new Date(req.body.dueDate),
      new Date(req.body.reviewPublishDate),
      new Date(req.body.reviewDueDate),
      req.body.reviewEvaluationDueDate
        ? new Date(req.body.reviewEvaluationDueDate)
        : null,
      req.body.description,
      req.body.filename,
      req.body.externalLink
    );
    await assignment.save();
    res.send(assignment);
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
