import { getManager } from "typeorm";
import QuestionType from "../enum/QuestionType";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import MultipleChoiceQuestionOption from "../models/MultipleChoiceQuestionOption";
import OpenQuestion from "../models/OpenQuestion";
import RangeQuestion from "../models/RangeQuestion";
import UploadQuestion from "../models/UploadQuestion";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import Questionnaire from "../models/Questionnaire";
import Question from "../models/Question";
import {
  templateQuestionsUngraded,
  templateQuestionsGraded,
} from "./templateQuestions";

const addDefaultReviewEvaluationQuestions = async function (
  reviewQuestionnaire: ReviewQuestionnaire,
  graded: boolean
): Promise<void> {
  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way to make sure not questions exist prior to adding questions
    async (transactionalEntityManager) => {
      const questionnaire = await transactionalEntityManager.findOne(
        ReviewQuestionnaire,
        reviewQuestionnaire.id
      );
      if (!questionnaire) {
        throw Error("Questionnaire not found");
      }
      if (questionnaire.questions.length > 0) {
        throw Error("Questionnaire already has questions");
      }
      const templateQuestions = graded
        ? templateQuestionsGraded
        : templateQuestionsUngraded;
      for (const questionToCopy of templateQuestions) {
        switch (questionToCopy.type) {
          case QuestionType.CHECKBOX: {
            const question = new CheckboxQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionToCopy.graded,
              questionnaire
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const optionToCopy of questionToCopy.options!) {
              const option = new CheckboxQuestionOption(
                optionToCopy.text,
                question,
                optionToCopy.points || null
              );
              await option.validateOrReject();
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.MULTIPLE_CHOICE: {
            const question = new MultipleChoiceQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionToCopy.graded,
              questionnaire
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const optionToCopy of questionToCopy.options!) {
              const option = new MultipleChoiceQuestionOption(
                optionToCopy.text,
                question,
                optionToCopy.points || null
              );
              await option.validateOrReject();
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.OPEN: {
            const question = new OpenQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionnaire
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            break;
          }
          case QuestionType.RANGE: {
            const question = new RangeQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionnaire,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              questionToCopy.range!
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            break;
          }
          case QuestionType.UPLOAD: {
            const question = new UploadQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionnaire,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              questionToCopy.extensions!
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            break;
          }
          default: {
            throw new Error("Invalid QuestionType");
            break;
          }
        }
      }
    }
  );
  return;
};

const addCopyOfQuestions = async function (
  questionnaireToCopyTo: Questionnaire,
  questions: Question[]
): Promise<void> {
  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way to make sure not questions exist prior to adding questions
    async (transactionalEntityManager) => {
      const questionnaire = await transactionalEntityManager.findOne(
        Questionnaire,
        questionnaireToCopyTo.id
      );
      if (!questionnaire) {
        throw Error("Questionnaire not found");
      }
      if (questionnaire.questions.length > 0) {
        throw Error("Questionnaire already has questions");
      }
      for (const questionToCopy of questions) {
        if (questionToCopy instanceof CheckboxQuestion) {
          const question = new CheckboxQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionToCopy.graded,
            questionnaire
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const optionToCopy of questionToCopy.options!) {
            const option = new CheckboxQuestionOption(
              optionToCopy.text,
              question,
              optionToCopy.points
            );
            await option.validateOrReject();
            await transactionalEntityManager.save(option);
          }
        } else if (questionToCopy instanceof MultipleChoiceQuestion) {
          const question = new MultipleChoiceQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionToCopy.graded,
            questionnaire
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const optionToCopy of questionToCopy.options!) {
            const option = new MultipleChoiceQuestionOption(
              optionToCopy.text,
              question,
              optionToCopy.points
            );
            await option.validateOrReject();
            await transactionalEntityManager.save(option);
          }
        } else if (questionToCopy instanceof OpenQuestion) {
          const question = new OpenQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionnaire
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
        } else if (questionToCopy instanceof RangeQuestion) {
          const question = new RangeQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionnaire,
            questionToCopy.range
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
        } else if (questionToCopy instanceof UploadQuestion) {
          const question = new UploadQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionnaire,
            questionToCopy.extensions
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
        } else {
          throw new Error("Invalid QuestionType");
        }
      }
    }
  );
  return;
};

export { addDefaultReviewEvaluationQuestions, addCopyOfQuestions };
