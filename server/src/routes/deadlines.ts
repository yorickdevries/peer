import { createQueryBuilder } from "typeorm";
import HttpStatusCode from "../enum/HttpStatusCode";

import express from "express";
const router = express.Router();

router.get("/assignment/:id", async (req, res) => {
  const user = req.user!;
  console.log(user);
  const dueDates = await createQueryBuilder("Assignment")
    .select([
      "Assignment.dueDate",
      "Assignment.reviewDueDate",
      "Assignment.reviewEvaluationDueDate",
    ])
    .getMany();
  console.log(dueDates);
  res.status(HttpStatusCode.OK).send(dueDates);
  return;
});

router.get("/assignment", async (_req, res) => {
  //console.log(req);
  res.status(HttpStatusCode.OK).send("Hello");
  return;
});

export default router;
