import { createQueryBuilder } from "typeorm";
import HttpStatusCode from "../enum/HttpStatusCode";

import express from "express";
const router = express.Router();

router.get("/assignment", async (_req, res) => {
  //This route could possibly be used to show students an overview of their assignments so no admin check
  const dueDates = await createQueryBuilder("Assignment").getMany();
  res.status(HttpStatusCode.OK).send(dueDates);
  return;
});

export default router;
