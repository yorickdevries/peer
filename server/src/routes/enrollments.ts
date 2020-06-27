import express from "express";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Joi from "@hapi/joi";
import { validateBody } from "../middleware/validation";
import _ from "lodash";

const router = express.Router();

// get all the enrollments of the current student
router.get("/", async (req, res) => {
  const enrollments = await Enrollment.find({
    where: { userNetid: req.user!.netid },
    relations: ["course"],
    order: { courseId: "ASC" },
  });
  res.send(enrollments);
});

// Joi inputvalidation
const enrollmentSchema = Joi.object({
  courseId: Joi.number().integer().required(),
});
// post an enrollment (enroll in a course)
router.post("/", validateBody(enrollmentSchema), async (req, res) => {
  const user = req.user!;
  const courseId = req.body.courseId;
  try {
    const course = await Course.findOneOrFail(courseId);
    if (course.isEnrollable(user)) {
      const enrollment = new Enrollment(user, course, UserRole.STUDENT);
      await enrollment.save();
      res.send(enrollment);
    } else {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(`course with id ${courseId} is not enrollable`);
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
