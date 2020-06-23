import express from "express";
const router = express.Router();
import Faculty from "../models/Faculty";

router.get("/", async (_req, res) => {
  const faculties = await Faculty.find({ order: { name: "ASC" } });
  res.send(faculties);
});

export default router;
