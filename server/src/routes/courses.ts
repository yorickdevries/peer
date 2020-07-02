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
import {
  validateBody,
  validateParams,
  idSchema,
} from "../middleware/validation";
import _ from "lodash";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

// get all enrollable courses where the student isnt in enrolled yet
router.get("/enrollable", async (req, res) => {
  const user = req.user!;
  const courses = await Course.getEnrollable(user);
  const sortedCourses = _.sortBy(courses, "id");
  res.send(sortedCourses);
});

// get a course
router.get("/:id", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const courseId = req.params.id;
  const course = await Course.findOne(courseId);
  if (!course) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  if (!(await course.isEnrolled(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_ENROLLED_IN_COURSE);
    return;
  }
  res.send(course);
});

// Joi inputvalidation
const courseSchema = Joi.object({
  name: Joi.string().required(),
  courseCode: Joi.string().required(),
  enrollable: Joi.boolean().required(),
  facultyName: Joi.string().required(),
  academicYearName: Joi.string().required(),
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
    // find the faculty and academic year in the database
    const faculty = await Faculty.findOne(req.body.facultyName);
    if (!faculty) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("The specified faculty is not found");
      return;
    }
    const academicYear = await AcademicYear.findOne(req.body.academicYearName);
    if (!academicYear) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("The specified academic year is not found");
      return;
    }
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
    await getManager().transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // save the course so it gets an id
        await transactionalEntityManager.save(course);
        // here the current user needs to be enrolled as teacher fot he just created course
        const enrollment = new Enrollment(user, course, UserRole.TEACHER);
        await transactionalEntityManager.save(enrollment);
      }
    );
    // reload course to get all data
    await course.reload();
    // if all goes well, the course can be returned
    res.send(course);
  }
);

// post an enrollment (enroll in a course)
router.post("/:id/enroll", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const courseId = req.params.id;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  if (!(await course.isEnrollable(user))) {
    res.status(HttpStatusCode.BAD_REQUEST).send("The course is not enrollable");
    return;
  }
  const enrollment = new Enrollment(user, course, UserRole.STUDENT);
  await enrollment.save();
  res.send(enrollment);
});

// get your enrollment fr a course
router.get("/:id/enrollment", validateParams(idSchema), async (req, res) => {
  const user = req.user!;
  const courseId = req.params.id;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  const enrollment = await Enrollment.findOne({
    where: { courseId: courseId, userNetid: user.netid },
  });
  if (!enrollment) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
    return;
  }
  res.send(enrollment);
});

// get all enrollable assignments for a certain course
router.get(
  "/:id/enrollableassignments",
  validateParams(idSchema),
  async (req, res) => {
    const user = req.user!;
    const course = await Course.findOne(req.params.courseId);
    if (!course) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.COURSE_NOT_FOUND);
      return;
    }
    if (!(await course.isEnrolled(user, UserRole.STUDENT))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_ENROLLED_IN_COURSE);
      return;
    }
    const enrollableAssignments = await course.getEnrollableAssignments(user);
    const sortedEnrollableAssignments = _.sortBy(enrollableAssignments, "id");
    res.send(sortedEnrollableAssignments);
  }
);

// get all enrolled assignments for students
router.get(
  "/:id/enrolledassignments",
  validateParams(idSchema),
  async (req, res) => {
    const user = req.user!;
    const course = await Course.findOne(req.params.courseId);
    if (!course) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.COURSE_NOT_FOUND);
      return;
    }
    if (!(await course.isEnrolled(user, UserRole.STUDENT))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_ENROLLED_IN_COURSE);
      return;
    }
    const enrolledAssignments = await course.getPublishedEnrolledAssignments(
      user
    );
    const sortedEnrolledAssignments = _.sortBy(enrolledAssignments, "id");
    res.send(sortedEnrolledAssignments);
  }
);

export default router;
