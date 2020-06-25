import express from "express";
import Joi from "@hapi/joi";
import AcademicYear from "../models/AcademicYear";
import { validateQuery } from "../middleware/validation";

const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  active: Joi.boolean(),
});
// get academic years, possibly with filter based on query
router.get("/", validateQuery(querySchema), async (req, res) => {
  // check whether the schema is compliant with what is expected
  const faculties = await AcademicYear.find({
    where: req.query,
    order: { name: "ASC" },
  });
  res.send(faculties);
});

export default router;
