import express from "express";
import _ from "lodash";
import Joi from "@hapi/joi";
import {
  idSchema,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { DataType } from "../enum/DataType";
import Assignment from "../models/Assignment";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import { getManager, In } from "typeorm";
import moment from "moment";
import Submission from "../models/Submission";
import ReviewOfReview from "../models/ReviewOfReview";

const router = express.Router();

// Joi inputvalidation for query
const querySchema = Joi.object({
  dataType: Joi.string()
    .valid(...Object.values(DataType.Assignment))
    .required(),
});
// get data for specified assignment and dataType
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

    switch (req.query.dataType) {
      case DataType.Assignment.AVG_REVIEW_TIME: {
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
      case DataType.Assignment.TIME_SUBMIT_BEFORE_DEADLINE: {
        const submissions: Submission[] = await getManager()
          .createQueryBuilder(Submission, "submission")
          .where("submission.final IS TRUE")
          .leftJoin("submission.assignmentVersion", "assignmentVersion")
          .andWhere("assignmentVersion.assignmentId = :id", {
            id: assignment.id,
          })
          .getMany();

        const assignmentDeadline = assignment.dueDate;

        const createTimes = submissions.map((s) => s.createdAt);
        res.send({
          deadline: assignmentDeadline,
          times: createTimes,
        });
        break;
      }
      case DataType.Assignment.PARTICIPATION: {
        // num groups, num reviews distributed, num reviews submitted
        // num groups with final submission, num reviews submitted, num feedback reviews submitted

        const groups = await assignment.getGroups();
        const assignmentVersions = assignment.versions;

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

        const reviewIds = reviews.map((r) => r.id);

        const feedbackReviews: ReviewOfReview[] =
          reviewIds.length > 0
            ? await ReviewOfReview.find({
                where: {
                  reviewOfSubmission: In(reviewIds),
                },
              })
            : [];

        const numOfAssignedFeedbackReviews = feedbackReviews.length;
        const numOfFeedbackReviewsNotCompleted = feedbackReviews.filter(
          (r) => !r.submitted
        ).length;

        const finalSubmissionNumber = await Promise.all(
          assignmentVersions.map(
            async (v) => (await v.getFinalSubmissionsOfEachGroup()).length
          )
        );
        const finalSubmissionLength = _.sum(finalSubmissionNumber);

        res.send([
          {
            status: "Initial",
            submissions: groups.length,
            reviews: numOfAssignedReviews,
            feedback: numOfAssignedFeedbackReviews,
          },
          {
            status: "Final",
            submissions: finalSubmissionLength,
            reviews: numOfReviewsNotCompleted,
            feedback: numOfFeedbackReviewsNotCompleted,
          },
        ]);
        break;
      }
    }

    res.status(HttpStatusCode.NOT_FOUND).send();
  }
);

export default router;
