import express from "express";
import Enrollment from "../models/Enrollment";
import HttpStatusCode from "../enum/HttpStatusCode";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import Joi from "joi";
import { validateBody, validateQuery } from "../middleware/validation";
import ResponseMessage from "../enum/ResponseMessage";
import User from "../models/User";
import upload from "../middleware/upload";
import config from "config";
import path from "path";
import { parse } from "csv-parse";
import * as fs from "fs";
import { dataSource } from "../databaseConnection";

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
  const course = await Course.findOneBy({
    id: courseId,
  });
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
  const course = await Course.findOneBy({
    id: courseId,
  });
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
  await dataSource.manager.transaction(
    "READ COMMITTED",
    async (transactionalEntityManager) => {
      let user = await transactionalEntityManager.findOne(User, {
        where: { netid: userNetid },
      });
      // in case the user doesnt exists in the database yet, create it
      if (!user) {
        user = new User().init({ netid: userNetid });
        await user.validateOrReject();
        await transactionalEntityManager.save(user);
      }
      // enroll user in the course if not already
      enrollment = new Enrollment().init({
        user: user,
        course: course,
        role: role,
      });
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

//enroll multiple TAs for a course from a csv file
const maxFileSize = config.get("maxFileSize") as number;
router.post(
  "/enrollMultiple",
  upload([".*"], maxFileSize, "file"),
  async (req, res) => {
    const user = req.user!;
    if (!req.file) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("File is needed for enrollment");
      return;
    } else {
      type PersonObj = {
        courseId: string;
        netId: string;
        role: string;
      };

      const csvFilePath = path.resolve(__dirname, `../../${req.file.path}`);

      const headers = ["netId", "role"];

      const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

      let listOfPeople: PersonObj[];

      parse(
        fileContent,
        {
          delimiter: [",", ";"],
          columns: headers,
        },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (error, result: PersonObj[]) => {
          if (error) {
            console.error(error);
            res.send(HttpStatusCode.BAD_REQUEST);
          }
          listOfPeople = result;

          for (const t of listOfPeople) {
            const existingEnrollment = await Enrollment.findOne({
              where: { userNetid: t.netId, courseId: req.body.courseId },
            });
            if (existingEnrollment) {
              res
                .status(HttpStatusCode.FORBIDDEN)
                .send(`User '${t.netId}' is already enrolled in this course`);
              return;
            }
          }

          for (const t of listOfPeople) {
            const userNetid: string = t.netId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let role: UserRole;
            if (t.role === "TA") {
              role = UserRole.TEACHING_ASSISTANT;
            } else if (t.role === "Teacher") {
              role = UserRole.TEACHER;
            } else {
              res
                .status(HttpStatusCode.BAD_REQUEST)
                .send("Not everyone is a TA or a Teacher");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const courseId = req.body.courseId;

            const course = await Course.findOneBy({
              id: Number(courseId),
            });
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
            await dataSource.manager.transaction(
              "READ COMMITTED",
              async (transactionalEntityManager) => {
                let user = await transactionalEntityManager.findOne(User, {
                  where: { netid: userNetid },
                });
                // in case the user doesnt exists in the database yet, create it
                if (!user) {
                  user = new User().init({ netid: userNetid });
                  await user.validateOrReject();
                  await transactionalEntityManager.save(user);
                }
                // enroll user in the course if not already
                const enrollment = new Enrollment().init({
                  user: user,
                  course: course,
                  role: role,
                });
                // in case another enrollment is made in the meantime it will error due to primary key constraints
                await enrollment.validateOrReject();
                await transactionalEntityManager.save(enrollment);
              }
            );
          }
          res.send(HttpStatusCode.OK);
        }
      );
    }
  }
);

const deleteEnrollmentSchema = Joi.object({
  userNetid: Joi.string().required(),
  courseId: Joi.number().integer().required(),
});
//delete a user
router.delete("/", validateQuery(deleteEnrollmentSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  // this value has been parsed by the validate function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userNetid: string = req.query.userNetid as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseId: number = req.query.courseId as any;
  const course = await Course.findOneBy({
    id: courseId,
  });
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
    where: { userNetid: userNetid, courseId: courseId },
  });
  if (!existingEnrollment) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_ENROLLED_IN_COURSE);
    return;
  }
  await existingEnrollment.remove();
  res.send(existingEnrollment);
});

export default router;
