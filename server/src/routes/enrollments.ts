import express from "express";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Joi from "@hapi/joi";
import { validateQuery, validateBody } from "../middleware/validation";
import ResponseMessage from "../enum/ResponseMessage";
import { getManager } from "typeorm";
import User from "../models/User";

const router = express.Router();

// Joi inputvalidation
const queryCourseIdSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  role: Joi.string().valid(...Object.values(UserRole)),
});
// get all all enrollments (for teacher) for specific course
router.get("/", validateQuery(queryCourseIdSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

// Joi inputvalidation
const enrollmentSchema = Joi.object({
  courseId: Joi.number().integer().required(),
  userNetid: Joi.string().required(),
  role: Joi.string().valid(...Object.values(UserRole)),
});
// create an enrollment for a course
router.post("/", validateBody(enrollmentSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  const userNetid = req.body.userNetid as any;
  const role = req.body.role as any;
  const courseId = req.body.courseId as any;
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
  let enrollment: Enrollment;
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      let user = await transactionalEntityManager.findOne(User, userNetid);
      // in case the user doesnt exists in the database yet, create it
      if (!user) {
        user = new User(userNetid);
        await transactionalEntityManager.save(user);
      }
      // enroll user in the course if not already
      const existingEnrollment = await transactionalEntityManager.findOne(
        Enrollment,
        {
          where: { userNetid: user.netid, courseId: course.id },
        }
      );
      if (existingEnrollment) {
        throw new Error("User is already enrolled in this course");
      }
      // enroll the user as student in the course
      enrollment = new Enrollment(user, course, role);
      await transactionalEntityManager.save(enrollment);
    }
  );
  await enrollment!.reload();
  res.send(enrollment!);
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
