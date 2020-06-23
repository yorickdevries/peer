import express from "express";
const router = express.Router();
import Faculty from "../models/Faculty";
import _ from "lodash";

router.get("/", async (_req, res) => {
  const faculties = await Faculty.find();
  const faculties_sorted = _.sortBy(faculties, "name");
  res.send(faculties_sorted);
});

export default router;
