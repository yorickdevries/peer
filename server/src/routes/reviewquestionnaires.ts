import express from "express";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import { getManager } from "typeorm";
import ResponseMessage from "../enum/ResponseMessage";

const router = express.Router();

// Joi inputvalidation
const questionnaireSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// post a reviewQuestionnaire in an assignment
router.post("/", validateBody(questionnaireSchema), async (req, res) => {
  const user = req.user!;

  const assignment = await Assignment.findOne(req.body.assignmentId);
  if (!assignment) {
    res
      .status(HttpStatusCode.BAD_REQUEST)
      .send(ResponseMessage.ASSIGNMENT_NOT_FOUND);
    return;
  }
  if (
    // not a teacher
    !(await assignment.isTeacherInCourse(user))
  ) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send(ResponseMessage.NOT_TEACHER_IN_COURSE);
    return;
  }
  if (!assignment.reviewEvaluation) {
    res
      .status(HttpStatusCode.FORBIDDEN)
      .send("Review evaluation is not enabled");
    return;
  }
  if (await assignment.getReviewQuestionnaire()) {
    res.status(HttpStatusCode.FORBIDDEN).send("Questionnaire already exists");
    return;
  }
  const reviewQuestionnaire = new ReviewQuestionnaire();
  // start transaction make sure the questionnaire and assignment are both saved
  // and no questionnaire is made in the mean time
  await getManager().transaction(
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // get the assignment with questionnaires
      const assignment = await transactionalEntityManager.findOneOrFail(
        Assignment,
        req.body.assignmentId
      );
      // make sure the questionnaire not already exists
      if (assignment.reviewQuestionnaireId) {
        throw new Error("Questionnaire already exists");
      }
      // save questionnaire
      await transactionalEntityManager.save(reviewQuestionnaire);

      // save the assignment with the questionnaire
      assignment.reviewQuestionnaire = reviewQuestionnaire;
      await transactionalEntityManager.save(assignment);
    }
  );
  // reload questionnaire to get all data
  // reviewQuestionnaire should be defined now (else we would be in the catch)
  await reviewQuestionnaire!.reload();
  res.send(reviewQuestionnaire!);
});

export default router;
