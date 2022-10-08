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
          .where("review.submitted IS TRUE")
          .leftJoin("review.submission", "submission")
          .leftJoin("submission.assignmentVersion", "assignmentVersion")
          .andWhere("assignmentVersion.assignmentId = :id", {
            id: assignment.id,
          })
          .getMany();

        const timeDeltas = reviews.map((r) =>
          moment.utc(r.submittedAt).diff(moment.utc(r.startedAt), "minutes")
        );
        res.send(timeDeltas);
        break;
      }
      case ChartType.Assignment.TIME_SUBMIT_BEFORE_DEADLINE: {
        const submissions: Submission[] = await getManager()
          .createQueryBuilder(Submission, "submission")
          .where("submission.final IS TRUE")
          .leftJoin("submission.assignmentVersion", "assignmentVersion")
          .andWhere("assignmentVersion.assignmentId = :id", {
            id: assignment.id,
          })
          .getMany();

        const assignmentDeadline = assignment.dueDate;

        const lastUpdateTimes = submissions.map((s) => s.updatedAt);
        res.send({
          deadline: assignmentDeadline,
          times: lastUpdateTimes,
        });
        break;
      }
      case ChartType.Assignment.NUM_OF_NO_REVIEWS: {
        const reviews: ReviewOfSubmission[] = await getManager()
          .createQueryBuilder(ReviewOfSubmission, "review")
          .leftJoin("review.submission", "submission")
          .leftJoin("submission.assignmentVersion", "assignmentVersion")
          .where("assignmentVersion.assignmentId = :id", {
            id: assignment.id,
          })
          .getMany();

        const numOfAssignedReviews = reviews.length;
        const numOfReviewsNotCompleted = reviews.filter(
          (r) => !r.submitted
        ).length;

        res.send({
          total: numOfAssignedReviews,
          notCompleted: numOfReviewsNotCompleted,
        });
        break;
      }
    }

    res.status(HttpStatusCode.NOT_FOUND).send();
  }
);

export default router;
