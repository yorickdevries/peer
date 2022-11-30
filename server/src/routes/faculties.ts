import express from "express";
import Faculty from "../models/Faculty";
import {
  idSchema,
  validateBody,
  validateParams,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import Joi from "@hapi/joi";
import isAdmin from "../middleware/authentication/isAdmin";
import Course from "../models/Course";
const router = express.Router();

const postSchema = Joi.object({
  name: Joi.string().required(),
  longName: Joi.string().required(),
});
const patchSchema = Joi.object({
  name: Joi.string().required(),
  longName: Joi.string().required(),
});

router.get("/", async (_req, res) => {
  const faculties = await Faculty.find({ order: { name: "ASC" } });
  res.send(faculties);
});

router.get("/:id", validateParams(idSchema), async (req, res) => {
  const faculty = await Faculty.findOne({ where: { id: req.params.id } });
  if (!faculty) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.FACULTY_NOT_FOUND);
    return;
  }
  res.send(faculty);
});

router.post("/", isAdmin, validateBody(postSchema), async (req, res) => {
  const faculty = new Faculty(req.body.name, req.body.longName);
  await faculty.save();
  res.send(faculty);
});

router.patch(
  "/:id",
  isAdmin,
  validateParams(idSchema),
  validateBody(patchSchema),
  async (req, res) => {
    const faculty = await Faculty.findOne({ where: { id: req.params.id } });
    if (!faculty) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send(ResponseMessage.FACULTY_NOT_FOUND);
      return;
    }

    faculty.name = req.body.name;
    faculty.longName = req.body.longName;
    await faculty.save();
    res.send(faculty);
  }
);

router.delete("/:id", isAdmin, validateParams(idSchema), async (req, res) => {
  const faculty = await Faculty.findOne({ where: { id: req.params.id } });

  if (!faculty) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.FACULTY_NOT_FOUND);
    return;
  }

  const courses = await Course.find({ where: { faculty: faculty } });
  if (courses.length > 0) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.FACULTY_HAS_COURSES);
    return;
  }

  await faculty.remove();
  res.send(faculty);
});

export default router;
