import express from "express";
import Joi from "@hapi/joi";
import AcademicYear from "../models/AcademicYear";
import {
  idSchema,
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import isAdmin from "../middleware/authentication/isAdmin";
import Course from "../models/Course";

const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  active: Joi.boolean(),
});

const postSchema = Joi.object({
  name: Joi.string().required(),
  active: Joi.boolean().required(),
});
const patchSchema = Joi.object({
  name: Joi.string().required(),
  active: Joi.boolean().required(),
});

// get academic years, possibly with filter based on query
router.get("/", validateQuery(querySchema), async (req, res) => {
  // check whether the schema is compliant with what is expected
  const academicYears = await AcademicYear.find({
    where: req.query,
    order: { name: "ASC" },
  });
  res.send(academicYears);
});

router.get("/:id", validateParams(idSchema), async (req, res) => {
  const year = await AcademicYear.findOne({ where: { id: req.params.id } });
  if (!year) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.YEAR_NOT_FOUND);
    return;
  }
  res.send(year);
});

router.post("/", isAdmin, validateBody(postSchema), async (req, res) => {
  const year = new AcademicYear(req.body.name, req.body.active);
  await year.save();
  res.send(year);
});

router.patch(
  "/:id",
  isAdmin,
  validateParams(idSchema),
  validateBody(patchSchema),
  async (req, res) => {
    const year = await AcademicYear.findOne({ where: { id: req.params.id } });
    if (!year) {
      res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.YEAR_NOT_FOUND);
      return;
    }

    year.name = req.body.name;
    year.active = req.body.active;
    await year.save();
    res.send(year);
  }
);

router.delete("/:id", isAdmin, validateParams(idSchema), async (req, res) => {
  const year = await AcademicYear.findOne({ where: { id: req.params.id } });

  if (!year) {
    res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.YEAR_NOT_FOUND);
    return;
  }

  const courses = await Course.find({ where: { academicYear: year } });
  if (courses.length > 0) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.YEAR_HAS_COURSES);
    return;
  }

  await year.remove();
  res.send(year);
});

export default router;
