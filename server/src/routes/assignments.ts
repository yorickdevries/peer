import express from "express";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";
import upload from "../middleware/upload";
import config from "config";

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
  externalLink: Joi.string().allow(null).required(),
});
// post an assignment in a course
// allowed extensions
const allowedExtensions = config.get("allowedExtensions") as string[];
const maxFileSize = config.get("maxFileSize") as number;
router.post(
  "/",
  upload(allowedExtensions, maxFileSize, "file"),
  validateBody(assignmentSchema),
  async (req, res) => {
    try {
      const courseTeachers = await Enrollment.find({
        where: {
          courseId: req.body.courseId,
          role: UserRole.TEACHER,
        },
      });
      // check whether the user is teacher of the course
      if (
        _.some(courseTeachers, (o) => {
          return o.userNetid === req.user!.netid;
        })
      ) {
        // here the file needs to be saved as well
        const course = await Course.findOneOrFail(req.body.courseId);
        const assignment = new Assignment(
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
          null, //needs to be fixed with file object
          req.body.externalLink
        );
        await assignment.save();
        res.send(assignment);
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("User is not a teacher for the course");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
