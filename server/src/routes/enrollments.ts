import express from "express";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Joi from "@hapi/joi";
import { validateQuery } from "../middleware/validation";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

// Joi inputvalidation
const queryCourseIdSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  role: Joi.string().valid(...Object.values(UserRole)),
});
// get all all enrollments (for teacher) for specific course
router.get("/", validateQuery(queryCourseIdSchema), async (req, res) => {
  const user = req.user!;
  // this value has been parsed by the validate function
  const courseId = req.query.courseId as any;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  if (!(await course.isEnrolled(user, UserRole.TEACHER))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  const enrollments = await Enrollment.find({
    where: req.query,
    relations: ["user"],
    order: { userNetid: "ASC" },
  });
  res.send(enrollments);
});

// get all the enrollments of the current user
router.get("/enrolled", async (req, res) => {
  const enrollments = await Enrollment.find({
    where: { userNetid: req.user!.netid },
    relations: ["course"],
    order: { courseId: "ASC" },
  });
  res.send(enrollments);
});

export default router;
