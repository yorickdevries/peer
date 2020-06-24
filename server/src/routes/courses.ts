import express from "express";
import Joi from "@hapi/joi";
import checkEmployee from "../middleware/authentication/checkEmployee";
import Course from "../models/Course";
import HttpStatusCode from "../enum/HttpStatusCode";
import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";
import Enroll from "../models/Enroll";
import User from "../models/User";
import UserRole from "../enum/UserRole";
import _ from "lodash";

const router = express.Router();

// get all the courses where the user is enrolled in
router.get("/enrolled", async (req, res) => {
  const enrolls = await Enroll.find({
    where: { userNetid: req.user!.netid },
    relations: ["course"],
  });
  // map the courses to a courselist
  const enrolledCourses = _.map(enrolls, "course");
  res.send(enrolledCourses);
});

// get all enrollable courses where the student isnt in enrolled yet
router.get("/enrollable", async (req, res) => {
  const enrolls = await Enroll.find({
    where: { userNetid: req.user!.netid },
    relations: ["course"],
  });
  // map the courses to a list of course ids
  const enrolledCourseIds = _.map(enrolls, "course.id");
  // all enrollable courses
  // maybe check whether year is active?
  const enrollableCourses = await Course.find({
    where: { enrollable: true },
  });
  // filter all courses present in enrolledCourseIds
  const filteredEnrollableCourses = _.filter(enrollableCourses, (e) => {
    return enrolledCourseIds.indexOf(e.id) < 0;
  });
  res.send(filteredEnrollableCourses);
});

// Joi inputvalidation
const courseSchema = Joi.object({
  name: Joi.string().required(),
  courseCode: Joi.string().required(),
  enrollable: Joi.boolean().required(),
  faculty: Joi.string().required(),
  academicYear: Joi.string().required(),
  description: Joi.string().allow(null).required(),
});
// post a course
// needs to be checked whether the user is employee
router.post("/", checkEmployee, async (req, res) => {
  try {
    // check whether the schema is compliant with what is expected
    const error = courseSchema.validate(req.body).error;
    if (error) {
      throw error;
    } else {
      // find the faculty and academic year in the database
      const faculty = await Faculty.findOneOrFail(req.body.faculty);
      const academicYear = await AcademicYear.findOneOrFail(
        req.body.academicYear
      );
      // instantiate the course
      const course = new Course(
        req.body.name,
        req.body.courseCode,
        req.body.enrollable,
        faculty,
        academicYear,
        req.body.description
      );
      await course.save();
      // here the current user needs to be enrolled as teacher fot he just created course
      const currentUser = await User.findOneOrFail(req.user!.netid);
      await new Enroll(currentUser, course, UserRole.TEACHER).save();
      // if all goes well, the course can be returned
      res.send(course);
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
