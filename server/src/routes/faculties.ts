import express from "express";
const router = express.Router();
import Faculty from "../models/Faculty";
import _ from "lodash";

router.get("/", async (_req, res) => {
  const faculties = await Faculty.find();
  const facultiesSorted = _.sortBy(faculties, "name");
  res.send(facultiesSorted);
});

export default router;
