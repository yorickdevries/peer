import express from "express";
import Joi from "@hapi/joi";
import Assignment from "../models/Assignment";
import { validateBody, validateParams } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { getManager } from "typeorm";
import _ from "lodash";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";

const router = express.Router();

// Joi inputvalidation
const questionnaireSchema = Joi.object({
  id: Joi.number().integer().required(),
});
// get the submissionquestionaire for an assignment
router.get("/:id", validateParams(questionnaireSchema), async (req, res) => {
  const user = req.user!;
  try {
    // also load the questions
    const submissionQuestionaire = await SubmissionQuestionnaire.findOneOrFail(
      req.params.id,
      { relations: ["questions"] }
    );
    const assignment = await submissionQuestionaire.getAssignment();
    if (await assignment.isTeacherOfCourse(user)) {
      // sort the questions and return questionnaire
      const sortedQuestions = _.sortBy(
        submissionQuestionaire.questions,
        "number"
      );
      // sort the options alphabetically in case it is a question with options
      for (const question of sortedQuestions) {
        if (question instanceof CheckboxQuestion) {
          const sortedOptions = _.sortBy(question.options, "text");
          question.options = sortedOptions;
        } else if (question instanceof MultipleChoiceQuestion) {
          const sortedOptions = _.sortBy(question.options, "text");
          question.options = sortedOptions;
        }
      }
      submissionQuestionaire.questions = sortedQuestions;
      res.send(submissionQuestionaire);
    } else {
      //later we need to extend this so the students can access it when the assignment is in reivew state
      res
        .status(HttpStatusCode.FORBIDDEN)
        .send("You are not a teacher of this course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

// Joi inputvalidation
const questionnairePostSchema = Joi.object({
  assignmentId: Joi.number().integer().required(),
});
// post a submissionQuestionnaire in an assignment
router.post("/", validateBody(questionnairePostSchema), async (req, res) => {
  const user = req.user!;
  try {
    // find the assignment and course
    const assignment = await Assignment.findOneOrFail(req.body.assignmentId);
    if (await assignment.isTeacherOfCourse(user)) {
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
        .send("User is not a teacher of the course");
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).send(error);
  }
});

export default router;
