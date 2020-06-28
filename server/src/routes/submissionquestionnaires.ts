import express from "express";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import UserRole from "../enum/UserRole";
import { validateBody } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
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
    const course = await assignment.getCourse();
    if (await course.isEnrolled(user, UserRole.TEACHER)) {
      // check if the questionnaire isnt already defined
      if (!(await assignment.getSubmissionQuestionnaire())) {
        const submissionQuestionnaire = new SubmissionQuestionnaire();
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
            if (assignment.submissionQuestionnaire) {
              throw "Questionnaire already exists";
            }
            // save questionnaire
            await transactionalEntityManager.save(submissionQuestionnaire);

            // save the assignment with the questionnaire
            assignment.submissionQuestionnaire = submissionQuestionnaire;
            await transactionalEntityManager.save(assignment);
          }
        );
        // reload questionnaire to get all data
        // submissionQuestionnaire should be defined now (else we would be in the catch)
        await submissionQuestionnaire!.reload();
        res.send(submissionQuestionnaire!);
      } else {
        res
          .status(HttpStatusCode.FORBIDDEN)
          .send("Questionnaire already exists");
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
