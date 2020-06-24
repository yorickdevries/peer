import express from "express";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import User from "../models/User";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Joi from "@hapi/joi";
import _ from "lodash";

const router = express.Router();

// get all the enrollments of the current student
router.get("/", async (req, res) => {
  const enrollments = await Enrollment.find({
    where: { userNetid: req.user!.netid },
    relations: ["course"],
  });
  res.send(enrollments);
});

// Joi inputvalidation
const enrollmentSchema = Joi.object({
  courseId: Joi.number().required(),
});
// post an enrollment
router.post("/", async (req, res) => {
  const user = await User.findOne(req.user?.netid);
  const error = enrollmentSchema.validate(req.body).error;
  if (error || !user) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  } else {
    const courseId: number = req.body.courseId;
    const enrollableCourses = await Course.getEnrollableCourses(user);
    const course = _.find(enrollableCourses, { id: courseId });
    if (course) {
      const enrollment = new Enrollment(user, course, UserRole.STUDENT);
      await enrollment.save();
      res.send(enrollment);
    } else {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(`course with id ${courseId} is not enrollable`);
    }
  }
});

export default router;
