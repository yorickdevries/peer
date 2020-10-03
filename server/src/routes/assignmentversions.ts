import express from "express";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import { AssignmentState } from "../enum/AssignmentState";
import {
  validateBody,
  validateParams,
  idSchema,
  validateQuery,
} from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import AssignmentVersion from "../models/AssignmentVersion";
import ResponseMessage from "../enum/ResponseMessage";
import Group from "../models/Group";
import _ from "lodash";

const router = express.Router();

router.get("/:id", validateParams(idSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignmentVersion = await AssignmentVersion.findOne(req.params.id);
  if (!assignmentVersion) {
    res
      .status(HttpStatusCode.NOT_FOUND)
      .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
    return;
  }
  const assignment = await assignmentVersion.getAssignment();
  if (
    (await assignment.isEnrolledInGroup(user)) &&
    assignment.isAtState(AssignmentState.UNPUBLISHED)
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("This assignment is not published yet");
    return;
  }
  if (
    !(
      (await assignment.isTeacherInCourse(user)) ||
      (await assignment.isEnrolledInGroup(user))
    )
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("You are not allowed to view this assignment");
    return;
  }
  const assignmentVersionWithVersionsToReview = await assignmentVersion.getAssignmentVersionWithVersionsToReview();
  res.send(assignmentVersionWithVersionsToReview);
});

// Joi inputvalidation
const assignmentVersionSchema = Joi.object({
  name: Joi.string().required(),
  assignmentId: Joi.number().integer().required(),
  reviewsPerUserPerAssignmentVersionToReview: Joi.number().integer().required(),
});
// post an assignmentVersion in a course
router.post("/", validateBody(assignmentVersionSchema), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  const assignment = await Assignment.findOne(req.body.assignmentId);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(`Assignment with id ${req.body.assignmentId} does not exist`);
    return;
  }
  if (!(await assignment.isTeacherInCourse(user))) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("User is not a teacher of the course");
    return;
  }
  if (!assignment.isAtState(AssignmentState.UNPUBLISHED)) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("The assignment is already published");
    return;
  }
  const assignmentVersion = new AssignmentVersion(
    req.body.name,
    assignment,
    [], // no versions yet (should be changed via patch route)
    req.body.reviewsPerUserPerAssignmentVersionToReview,
    false // default self review is false (can be changed via patch route)
  );
  await assignmentVersion.save();
  const assignmentVersionWithVersionsToReview = await assignmentVersion.getAssignmentVersionWithVersionsToReview();
  res.send(assignmentVersionWithVersionsToReview);
});

// Joi inputvalidation
const assignmentPatchVersionSchema = Joi.object({
  name: Joi.string().required(),
  assignmentVersionsToReview: Joi.array()
    .items(Joi.number().integer())
    .required(),
  reviewsPerUserPerAssignmentVersionToReview: Joi.number().integer().required(),
  selfReview: Joi.boolean().required(),
});
// patch an assignment in a course
router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(assignmentPatchVersionSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignmentVersion = await AssignmentVersion.findOne(req.params.id);
    if (!assignmentVersion) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send("Assignmentversion not found");
      return;
    }
    const assignment = await assignmentVersion.getAssignment();
    if (!(await assignment.isTeacherInCourse(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
      return;
    }
    if (!assignment.isAtOrBeforeState(AssignmentState.WAITING_FOR_REVIEW)) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("The assignment is not at or before waiting-for-review state");
      return;
    }
    const versionsToReview: AssignmentVersion[] = [];
    for (const assignmentVersionsToReviewId of req.body
      .assignmentVersionsToReview) {
      const versionToReview = await AssignmentVersion.findOne(
        assignmentVersionsToReviewId
      );
      if (!versionToReview) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Assignmentversion not found");
        return;
      }
      if (versionToReview.assignmentId !== assignment.id) {
        res
          .status(HttpStatusCode.BAD_REQUEST)
          .send("Assignmentversion is of another assignment");
        return;
      }
      versionsToReview.push(versionToReview);
    }
    // check whether certain fields can be changed
    if (
      assignment.isAtOrAfterState(AssignmentState.REVIEW) &&
      assignmentVersion.reviewsPerUserPerAssignmentVersionToReview !==
        req.body.reviewsPerUserPerAssignmentVersionToReview
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You cannot change reviewsPerUser at this state");
      return;
    }
    // patch assignmentVersion
    assignmentVersion.name = req.body.name;
    assignmentVersion.versionsToReview = versionsToReview;
    assignmentVersion.reviewsPerUserPerAssignmentVersionToReview =
      req.body.reviewsPerUserPerAssignmentVersionToReview;
    assignmentVersion.selfReview = req.body.selfReview;

    // perform save
    await assignmentVersion.save();
    const assignmentVersionWithVersionsToReview = await assignmentVersion.getAssignmentVersionWithVersionsToReview();
    res.send(assignmentVersionWithVersionsToReview);
  }
);

// Joi inputvalidation for query
const querySubmissionSchema = Joi.object({
  groupId: Joi.number().integer().required(),
});

// get the submissions of a group
router.get(
  "/:id/submissions",
  validateParams(idSchema),
  validateQuery(querySubmissionSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignmentVersionId = req.params.id;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupId: number = req.query.groupId as any;
    const assignmentVersion = await AssignmentVersion.findOne(
      assignmentVersionId
    );
    if (!assignmentVersion) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
      return;
    }
    const group = await Group.findOne(groupId);
    if (!group) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.GROUP_NOT_FOUND);
      return;
    }
    if (
      !(await group.hasUser(user)) &&
      !(await assignmentVersion.isTeacherInCourse(user))
    ) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not part of the group");
      return;
    }
    const submissions = await assignmentVersion.getSubmissions(group);
    const sortedSubmissions = _.sortBy(submissions, "id");
    res.send(sortedSubmissions);
  }
);

// get the submission which will be used for reviewing of a group
router.get(
  "/:id/finalsubmission",
  validateParams(idSchema),
  validateQuery(querySubmissionSchema),
  async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = req.user!;
    const assignmentVersionId = req.params.id;
    // this value has been parsed by the validate function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupId: number = req.query.groupId as any;
    const assignmentVersion = await AssignmentVersion.findOne(
      assignmentVersionId
    );
    if (!assignmentVersion) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.ASSIGNMENTVERSION_NOT_FOUND);
      return;
    }
    const group = await Group.findOne(groupId);
    if (!group) {
      res
        .status(HttpStatusCode.BAD_REQUEST)
        .send(ResponseMessage.GROUP_NOT_FOUND);
      return;
    }
    if (!(await group.hasUser(user))) {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not part of the group");
      return;
    }
    console.log(assignmentVersion, group);
    const finalSubmission = await assignmentVersion.getFinalSubmission(group);
    if (!finalSubmission) {
      res
        .status(HttpStatusCode.NOT_FOUND)
        .send("No submissions have been made yet");
      return;
    }
    res.send(finalSubmission);
  }
);

export default router;
