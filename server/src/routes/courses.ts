import express from "express";
import { getManager } from "typeorm";
import Joi from "@hapi/joi";
import checkEmployee from "../middleware/authentication/checkEmployee";
import Course from "../models/Course";
import HttpStatusCode from "../enum/HttpStatusCode";
import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";
import Enrollment from "../models/Enrollment";
import UserRole from "../enum/UserRole";
import { validateBody } from "../middleware/validation";
import _ from "lodash";

const router = express.Router();

// get all enrollable courses where the student isnt in enrolled yet
router.get("/enrollable", async (req, res) => {
  const courses = await Course.getEnrollable(req.user!);
  const sortedCourses = _.sortBy(courses, "id");
  res.send(sortedCourses);
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
router.post(
  "/",
  checkEmployee,
  validateBody(courseSchema),
  async (req, res) => {
    const user = req.user!;
    try {
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
      // start transaction to both save the course and teacher enrollment
      await getManager().transaction(async (transactionalEntityManager) => {
        // save the course so it gets an id
        await transactionalEntityManager.save(course);
        // here the current user needs to be enrolled as teacher fot he just created course
        const enrollment = new Enrollment(user, course, UserRole.TEACHER);
        await transactionalEntityManager.save(enrollment);
      });
      // reload course to get all data
      await course.reload();
      // if all goes well, the course can be returned
      res.send(course);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
