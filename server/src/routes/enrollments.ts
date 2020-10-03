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
// get all enrollments (for teacher) for specific course
router.get("/", validateQuery(queryCourseIdSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseId: number = req.query.courseId as any;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  if (!(await course.isTeacher(user))) {
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
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
});
// create an enrollment for a course
router.post("/", validateBody(enrollmentSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userNetid: string = req.body.userNetid as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role: UserRole = req.body.role as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseId: number = req.body.courseId as any;
  const course = await Course.findOne(courseId);
  if (!course) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.COURSE_NOT_FOUND);
    return;
  }
  if (!(await course.isTeacher(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  const existingEnrollment = await Enrollment.findOne({
    where: { userNetid: userNetid, courseId: course.id },
  });
  if (existingEnrollment) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("User is already enrolled in this course");
    return;
  }
  let enrollment: Enrollment;
  await getManager().transaction(
    process.env.NODE_ENV === "test" ? "SERIALIZABLE" : "READ COMMITTED",
    async (transactionalEntityManager) => {
      let user = await transactionalEntityManager.findOne(User, userNetid);
      // in case the user doesnt exists in the database yet, create it
      if (!user) {
        user = new User(userNetid);
        await user.validateOrReject();
        await transactionalEntityManager.save(user);
      }
      // enroll user in the course if not already
      enrollment = new Enrollment(user, course, role);
      // in case another enrollment is made in the meantime it will error due to primary key constraints
      await enrollment.validateOrReject();
      await transactionalEntityManager.save(enrollment);
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await enrollment!.reload();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  res.send(enrollment!);
});

// get all the enrollments of the current user
router.get("/enrolled", async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const enrollments = await Enrollment.find({
    where: { userNetid: user.netid },
    relations: ["course"],
    order: { courseId: "ASC" },
  });
  res.send(enrollments);
});

export default router;
