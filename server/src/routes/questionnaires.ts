import express from "express";
import questionnaireType from "../enum/questionnaireType";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import UserRole from "../enum/UserRole";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import Questionnaire from "../models/Questionnaire";
import { getManager } from "typeorm";

const router = express.Router();

// Joi inputvalidation
const questionnaireSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
  questionnaireType: Joi.string()
    .valid(...[questionnaireType.SUBMISSION, questionnaireType.REVIEW])
    .required(),
});
// post a questionnaire in an assignment
router.post("/", validateBody(questionnaireSchema), async (req, res) => {
  const user = req.user!;
  try {
    // find the assignment and course
    const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
    const course = await assignment.getCourse();
    if (await course.isEnrolled(user, UserRole.TEACHER)) {
      // check if the questionnaire isnt already defined
      if (
        req.body.questionnaireType === questionnaireType.SUBMISSION &&
        !(await assignment.getSubmissionQuestionnaire())
      ) {
        let questionnaire: Questionnaire;
        // start transaction make sure the questionnaire and assignment are both saved
        // and no questionnaire s made in the mean time
        await getManager().transaction(
          "SERIALIZABLE",
          async (transactionalEntityManager) => {
            // get the assignment with questionnaire
            const assignment = await transactionalEntityManager.findOneOrFail(
              Assignment,
              req.body.assignmentId
            );
            // make sure the questionnaire not alraeady exists
            if (assignment.submissionQuestionnaire) {
              throw "Questionnaire already exists";
            }
            // create questionnaire
            questionnaire = new SubmissionQuestionnaire();
            await transactionalEntityManager.save(questionnaire);

            // save the assignment with the questionnaire
            assignment.submissionQuestionnaire = questionnaire;
            await transactionalEntityManager.save(assignment);
          }
        );
        // reload questionnaire to get all data
        // questionnaire should be defined now (else we would be in the catch)
        await questionnaire!.reload();
        res.send(questionnaire!);
      } else if (
        req.body.questionnaireType === questionnaireType.REVIEW &&
        (await assignment.reviewEvaluation) &&
        !(await assignment.getReviewQuestionnaire())
      ) {
        let questionnaire: Questionnaire;
        // start transaction make sure the questionnaire and assignment are both saved
        await getManager().transaction(
          "SERIALIZABLE",
          async (transactionalEntityManager) => {
            // get the assignment with questionnaire
            const assignment = await transactionalEntityManager.findOneOrFail(
              Assignment,
              req.body.assignmentId
            );
            // make sure the questionnaire not alraeady exists
            if (assignment.reviewQuestionnaire) {
              throw "Questionnaire already exists";
            }
            // create questionnaire
            questionnaire = new ReviewQuestionnaire();
            await transactionalEntityManager.save(questionnaire);

            // save the assignment with the questionnaire
            assignment.reviewQuestionnaire = questionnaire;
            await transactionalEntityManager.save(assignment);
          }
        );
        // reload questionnaire to get all data
        // questionnaire should be defined now (else we would be in the catch)
        await questionnaire!.reload();
        res.send(questionnaire!);
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("Not possible to make questionnaire");
      }
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher for the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
