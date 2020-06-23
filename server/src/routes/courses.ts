import express from "express";
import Joi from "@hapi/joi";
import checkEmployee from "../middleware/authentication/checkEmployee";
import Course from "../models/Course";
import HttpStatusCode from "../enum/HttpStatusCode";
import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";

const router = express.Router();

// get all courses
// needs to be adapted so not all courses are visible
//router.get("/enrolled", async (_req, res) => {
//  const courses = await Course.find({ order: { name: "ASC" } });
//  res.send(courses);
//});

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
      // if all goes well, the course can be returned
      res.send(course);
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
