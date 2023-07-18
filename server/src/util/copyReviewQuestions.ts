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
import { templateQuestions } from "./templateQuestions";

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
      for (const questionToCopy of templateQuestions) {
        switch (questionToCopy.type) {
          case QuestionType.CHECKBOX: {
            const question = new CheckboxQuestion({
              text: questionToCopy.text,
              number: questionToCopy.number,
              optional: questionToCopy.optional,
              graded: graded ? questionToCopy.graded : false,
              questionnaire: questionnaire,
            });
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const optionToCopy of questionToCopy.options!) {
              const option = new CheckboxQuestionOption({
                text: optionToCopy.text,
                question: question,
                points: graded ? optionToCopy.points : null,
              });
              await option.validateOrReject();
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.MULTIPLE_CHOICE: {
            const question = new MultipleChoiceQuestion({
              text: questionToCopy.text,
              number: questionToCopy.number,
              optional: questionToCopy.optional,
              graded: graded ? questionToCopy.graded : false,
              questionnaire: questionnaire,
            });
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const optionToCopy of questionToCopy.options!) {
              const option = new MultipleChoiceQuestionOption({
                text: optionToCopy.text,
                question: question,
                points: graded ? optionToCopy.points : null,
              });
              await option.validateOrReject();
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.OPEN: {
            const question = new OpenQuestion({
              text: questionToCopy.text,
              number: questionToCopy.number,
              optional: questionToCopy.optional,
              questionnaire: questionnaire,
            });
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            break;
          }
          case QuestionType.RANGE: {
            const question = new RangeQuestion({
              text: questionToCopy.text,
              number: questionToCopy.number,
              optional: questionToCopy.optional,
              questionnaire: questionnaire,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              range: questionToCopy.range!,
            });
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            break;
          }
          case QuestionType.UPLOAD: {
            const question = new UploadQuestion({
              text: questionToCopy.text,
              number: questionToCopy.number,
              optional: questionToCopy.optional,
              questionnaire: questionnaire,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              extensions: questionToCopy.extensions!,
            });
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
          const question = new CheckboxQuestion({
            text: questionToCopy.text,
            number: questionToCopy.number,
            optional: questionToCopy.optional,
            graded: questionToCopy.graded,
            questionnaire: questionnaire,
          });
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const optionToCopy of questionToCopy.options!) {
            const option = new CheckboxQuestionOption({
              text: optionToCopy.text,
              question: question,
              points: optionToCopy.points,
            });
            await option.validateOrReject();
            await transactionalEntityManager.save(option);
          }
        } else if (questionToCopy instanceof MultipleChoiceQuestion) {
          const question = new MultipleChoiceQuestion({
            text: questionToCopy.text,
            number: questionToCopy.number,
            optional: questionToCopy.optional,
            graded: questionToCopy.graded,
            questionnaire: questionnaire,
          });
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const optionToCopy of questionToCopy.options!) {
            const option = new MultipleChoiceQuestionOption({
              text: optionToCopy.text,
              question: question,
              points: optionToCopy.points,
            });
            await option.validateOrReject();
            await transactionalEntityManager.save(option);
          }
        } else if (questionToCopy instanceof OpenQuestion) {
          const question = new OpenQuestion({
            text: questionToCopy.text,
            number: questionToCopy.number,
            optional: questionToCopy.optional,
            questionnaire: questionnaire,
          });
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
        } else if (questionToCopy instanceof RangeQuestion) {
          const question = new RangeQuestion({
            text: questionToCopy.text,
            number: questionToCopy.number,
            optional: questionToCopy.optional,
            questionnaire: questionnaire,
            range: questionToCopy.range,
          });
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
        } else if (questionToCopy instanceof UploadQuestion) {
          const question = new UploadQuestion({
            text: questionToCopy.text,
            number: questionToCopy.number,
            optional: questionToCopy.optional,
            questionnaire: questionnaire,
            extensions: questionToCopy.extensions,
          });
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
