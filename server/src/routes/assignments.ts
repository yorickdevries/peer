import express from "express";
import Joi from "@hapi/joi";
import { getManager } from "typeorm";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validation";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import File from "../models/File";
import HttpStatusCode from "../enum/HttpStatusCode";
import upload from "../middleware/upload";
import config from "config";
import hasha from "hasha";
import path from "path";
import fsPromises from "fs/promises";
import _ from "lodash";
import Group from "../models/Group";

const router = express.Router();

// config values
const uploadFolder = config.get("uploadFolder") as string;
const allowedExtensions = config.get("allowedExtensions") as string[];
const maxFileSize = config.get("maxFileSize") as number;

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
      const allAssignments = await course.getAssignments();
      const sortedAllAssignments = _.sortBy(allAssignments, "id");
      res.send(sortedAllAssignments);
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You are not a teacher of this course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

// get all enrollable assignments for a certain course
router.get(
  "/enrollable",
  validateQuery(queryCourseIdSchema),
  async (req, res) => {
    const user = req.user!;
    // this value has been parsed by the validate function
    const courseId = req.query.courseId as any;
    try {
      const course = await Course.findOneOrFail(courseId);
      const enrollableAssignments = await course.getEnrollableAssignments(user);
      const sortedEnrollableAssignments = _.sortBy(enrollableAssignments, "id");
      res.send(sortedEnrollableAssignments);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

// get all enrolled assignments for students
router.get(
  "/enrolled",
  validateQuery(queryCourseIdSchema),
  async (req, res) => {
    const user = req.user!;
    // this value has been parsed by the validate function
    const courseId = req.query.courseId as any;
    try {
      const course = await Course.findOneOrFail(courseId);
      const enrolledAssignments = await course.getPublishedEnrolledAssignments(
        user
      );
      const sortedEnrolledAssignments = _.sortBy(enrolledAssignments, "id");
      res.send(sortedEnrolledAssignments);
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

// Joi inputvalidation
const assignmentSchema = Joi.object({
  name: Joi.string().required(),
  courseId: Joi.number().integer().required(),
  reviewsPerUser: Joi.number().integer().required(),
  enrollable: Joi.boolean().required(),
  reviewEvaluation: Joi.boolean().required(),
  publishDate: Joi.date().required(),
  dueDate: Joi.date().required(),
  reviewPublishDate: Joi.date().required(),
  reviewDueDate: Joi.date().required(),
  reviewEvaluationDueDate: Joi.date().allow(null).required(),
  description: Joi.string().allow(null).required(),
  externalLink: Joi.string().allow(null).required(),
});
// post an assignment in a course
router.post(
  "/",
  upload(allowedExtensions, maxFileSize, "file"),
  validateBody(assignmentSchema),
  async (req, res) => {
    const user = req.user!;
    try {
      const course = await Course.findOneOrFail(req.body.courseId);
      if (await course.isEnrolled(user, UserRole.TEACHER)) {
        let assignment: Assignment;
        // start transaction make sure the file and assignment are both saved
        await getManager().transaction(
          "SERIALIZABLE",
          async (transactionalEntityManager) => {
            // create the file object or leave it as null if no file is uploaded
            let file: File | null = null;
            if (req.file) {
              // file info
              const fileBuffer = req.file.buffer;
              const fileExtension = path.extname(req.file.originalname);
              const fileName = path.basename(
                req.file.originalname,
                fileExtension
              );
              const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
              file = new File(fileName, fileExtension, fileHash);
              await transactionalEntityManager.save(file);
            }

            // create assignment
            assignment = new Assignment(
              req.body.name,
              course,
              req.body.reviewsPerUser,
              req.body.enrollable,
              req.body.reviewEvaluation,
              req.body.publishDate,
              req.body.dueDate,
              req.body.reviewPublishDate,
              req.body.reviewDueDate,
              req.body.reviewEvaluationDueDate,
              req.body.description,
              file,
              req.body.externalLink
            );
            await transactionalEntityManager.save(assignment);

            // save the file to disk lastly
            // (if this goes wrong all previous steps are rolled back)
            if (file?.id && req.file) {
              const filePath = path.resolve(uploadFolder, file.id.toString());
              await fsPromises.writeFile(filePath, req.file.buffer);
            }
          }
        );
        // reload assignment to get all data
        // assignment should be defined now (else we would be in the catch)
        await assignment!.reload();
        res.send(assignment!);
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("User is not a teacher for the course");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

// Joi inputvalidation for query
const assignmentIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});
router.post(
  "/:id/enroll",
  validateParams(assignmentIdSchema),
  async (req, res) => {
    const user = req.user!;
    try {
      const assignment = await Assignment.findOneOrFail(req.params.id);
      if (await assignment.isEnrollable(user)) {
        const group = new Group(user.netid, [user], [assignment]);
        // save the group in an transaction to make sure no 2 groups are saved at the same time
        await getManager().transaction(
          "SERIALIZABLE",
          async (transactionalEntityManager) => {
            // find all groups to check for group existence
            const allGroups = await transactionalEntityManager.find(Group, {
              relations: ["users", "assignments"],
            });
            const alreadyExists = _.some(allGroups, (group) => {
              return (
                _.some(group.users, (groupUser) => {
                  return groupUser.netid === user.netid;
                }) &&
                _.some(group.assignments, (groupAssignment) => {
                  return groupAssignment.id === assignment.id;
                })
              );
            });
            if (alreadyExists) {
              // throw error if a group already exists
              // Can happen if 2 concurrent calls are made
              throw "Group already exists";
            } else {
              await transactionalEntityManager.save(group);
            }
          }
        );
        // reload the group
        await group.reload();
        res.send(group);
      } else {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Assignment is not enrollable");
      }
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    }
  }
);

export default router;
