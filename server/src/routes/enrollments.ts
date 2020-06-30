import express from "express";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Joi from "@hapi/joi";
import { validateQuery } from "../middleware/validation";

const router = express.Router();

// Joi inputvalidation
const queryCourseIdSchema = Joi.object({
  courseId: Joi.number().integer().required(),
});
// get all all assignments (for teacher) for specific course
router.get("/", validateQuery(queryCourseIdSchema), async (req, res) => {
  const user = req.user!;
  // this value has been parsed by the validate function
  const courseId = req.query.courseId as any;
  try {
    const course = await Course.findOneOrFail(courseId);
    if (await course.isEnrolled(user, UserRole.TEACHER)) {
      const enrollments = await Enrollment.find({
        where: { courseId: courseId },
        relations: ["user"],
        order: { userNetid: "ASC" },
      });
      res.send(enrollments);
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You are not a teacher of this course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
  }
});

// get all the enrollments of the current student
router.get("/enrolled", async (req, res) => {
  const enrollments = await Enrollment.find({
    where: { userNetid: req.user!.netid },
    relations: ["course"],
    order: { courseId: "ASC" },
  });
  res.send(enrollments);
});

export default router;
