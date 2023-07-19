import express from "express";
import { dataSource } from "../databaseConnection";
const router = express.Router();

router.get("/assignment", async (_req, res) => {
  const currDate: Date = new Date();
  //reviews
  const dueDates = await dataSource
    .createQueryBuilder("Assignment", "assignment")
    .leftJoin("assignment.course", "course")
    .select([
      "course.courseCode",
      "assignment.publishDate",
      "assignment.dueDate",
      "assignment.reviewPublishDate",
      "assignment.reviewDueDate",
      "assignment.reviewEvaluationDueDate",
      "assignment.reviewEvaluation",
    ])
    .where(
      "assignment.reviewDueDate >= :cd OR (assignment.reviewEvaluation = 1 AND assignment.reviewEvaluationDueDate >= :cd)",
      { cd: currDate }
    )
    .getMany();
  res.send(dueDates);
});

export default router;
