import express from "express";
import Joi from "@hapi/joi";
import {
  idSchema,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { ChartType } from "../enum/ChartType";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import { getManager } from "typeorm";
import moment from "moment";
import Submission from "../models/Submission";

const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  chartType: Joi.string()
    .valid(...Object.values(ChartType.Assignment))
    .required(),
});
// get data for specified assignment and charttype
router.get(
  "/assignment/:id",
  validateParams(idSchema),
  validateQuery(querySchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignment = await Assignment.findOne(req.params.id);
    if (!assignment) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }

    if (!(await assignment.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    }

    switch (req.query.chartType) {
      case ChartType.Assignment.AVG_REVIEW_TIME: {
        const reviews: ReviewOfSubmission[] = await getManager()
          .createQueryBuilder(ReviewOfSubmission, "review")
          .leftJoin("review.submission", "submission")
          .leftJoin("submission.assignmentVersion", "assignmentVersion")
          .where("assignmentVersion.assignmentId = :id", { id: assignment.id })
          .getMany();

        const timeDeltas = reviews
          .filter((r) => r.startedAt && r.submittedAt)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((r) =>
            moment.utc(r.submittedAt!).diff(moment.utc(r.startedAt), "minutes")
          );
        res.send(timeDeltas);
        break;
      }
      case ChartType.Assignment.TIME_SUBMIT_BEFORE_DEADLINE: {
        const reviews: Submission[] = await getManager()
          .createQueryBuilder(Submission, "submission")
          .where("submission.final = true")
          .leftJoin("submission.assignmentVersion", "assignmentVersion")
          .where("assignmentVersion.assignmentId = :id", { id: assignment.id })
          .getMany();

        //get assignment deadline
        const assignmentDeadline = assignment.dueDate;

        const lastUpdateTimes = reviews
          .filter((s) => s.updatedAt)
          .map((s) => s.updatedAt);
        res.send({
          deadline: assignmentDeadline,
          times: lastUpdateTimes,
        });
        break;
      }
    }

    res.status(HttpStatusCode.NOT_FOUND).send();
  }
);

export default router;
