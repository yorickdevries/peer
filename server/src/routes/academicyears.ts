import express from "express";
import Joi from "@hapi/joi";
import AcademicYear from "../models/AcademicYear";
import HttpStatusCode from "../enum/HttpStatusCode";
const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  active: Joi.boolean(),
});
// add joi request validation
router.get("/", async (req, res) => {
  // check whether the schema is compliant with what is expected
  const query = req.query;
  const error = querySchema.validate(query).error;
  if (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  } else {
    const faculties = await AcademicYear.find({
      where: query,
      order: { name: "ASC" },
    });
    res.send(faculties);
  }
});

export default router;
