import express from "express";
import Faculty from "../models/Faculty";
const router = express.Router();

router.get("/", async (_req, res) => {
  const faculties = await Faculty.find({ order: { name: "ASC" } });
  res.send(faculties);
});

export default router;
