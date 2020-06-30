import express from "express";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import { getManager } from "typeorm";

const router = express.Router();

// Joi inputvalidation
const questionnaireSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// post a submissionQuestionnaire in an assignment
router.post("/", validateBody(questionnaireSchema), async (req, res) => {
  const user = req.user!;
  try {
    // find the assignment and course
    const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
    if (await assignment.isTeacherOfCourse(user)) {
      // check if the questionnaire isnt already defined
      if (
        assignment.reviewEvaluation &&
        !(await assignment.getReviewQuestionnaire())
      ) {
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
            if (assignment.reviewQuestionnaire) {
              throw "Questionnaire already exists";
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
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("Questionnaire already exists");
      }
    } else {
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("User is not a teacher of the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
  }
});

export default router;
