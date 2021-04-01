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
import Extensions from "../enum/Extensions";

interface GradedOption {
  text: string;
  points: number;
}

interface NonGradedOption {
  text: string;
}
interface QuestionTemplate {
  text: string;
  number: number;
  optional: boolean;
  type: QuestionType;
  range?: number;
  extensions?: Extensions;
  options?: GradedOption[] | NonGradedOption[];
  graded?: boolean;
}

const templateQuestions: QuestionTemplate[] = [
  {
    text:
      "Was the review comprehensive and complete, covering all relevant aspects of the work?",
    number: 1,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ text: "A: Yes" }, { text: "B: No" }],
    graded: false,
  },
  {
    text: "Was the input factually correct?",
    number: 2,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, fully" },
      { text: "B: Yes, mostly" },
      { text: "C: No, mostly not" },
      { text: "D: No, not at all" },
    ],
    graded: false,
  },
  {
    text:
      "Did you, during later revision of the original submission, spot any mistakes that the reviewer overlooked?",
    number: 3,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, major mistakes" },
      { text: "B: Yes, minor mistakes" },
      { text: "C: No" },
    ],
    graded: false,
  },
  {
    text: "Did the reviewer submit any open feedback (text or pdf)?",
    number: 4,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ text: "A: Yes" }, { text: "B: No" }],
    graded: false,
  },
  {
    text: "If there was any open feedback, how much?",
    number: 5,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Too little" },
      { text: "B: An acceptable amount" },
      { text: "C: Much" },
      { text: "D: Not applicable" },
    ],
    graded: false,
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a clear and understandable way?",
    number: 6,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes" },
      { text: "B: No" },
      { text: "C: Not applicable" },
    ],
    graded: false,
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a constructive way, so giving an idea how to improve the work?",
    number: 7,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes" },
      { text: "B: No" },
      { text: "C: Not applicable" },
    ],
    graded: false,
  },
  {
    text: "Overall, do you agree with the reviewer's assessment of the work?",
    number: 8,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, fully" },
      { text: "B: Yes, mostly" },
      { text: "C: No, mostly not" },
      { text: "D: No, not at all" },
    ],
    graded: false,
  },
  {
    text: "What overall grade would you give the review?",
    number: 9,
    optional: false,
    type: QuestionType.RANGE,
    range: 10,
  },
  {
    text:
      'What do you think about the review overall? If you did not choose "Yes, fully" in question 2, then please list the factual mistakes of the review here, in a way that can be read without referring to the original submission or the review.',
    number: 10,
    optional: false,
    type: QuestionType.OPEN,
  },
];

const addDefaultReviewEvaluationQuestions = async function (
  reviewQuestionnaire: ReviewQuestionnaire
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
            const isGraded = Boolean(questionToCopy.graded);
            const question = new CheckboxQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionnaire,
              isGraded
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const optionToCopy of questionToCopy.options!) {
              if (!isGradedInstance(optionToCopy)) {
                break;
              }
              const option = new CheckboxQuestionOption(
                optionToCopy.text,
                question,
                optionToCopy.points
              );
              await option.validateOrReject();
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.MULTIPLE_CHOICE: {
            const isGraded = Boolean(questionToCopy.graded);
            const question = new MultipleChoiceQuestion(
              questionToCopy.text,
              questionToCopy.number,
              questionToCopy.optional,
              questionnaire,
              isGraded
            );
            await question.validateOrReject();
            await transactionalEntityManager.save(question);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const optionToCopy of questionToCopy.options!) {
              if (!isGradedInstance(optionToCopy)) {
                break;
              }
              const option = new MultipleChoiceQuestionOption(
                optionToCopy.text,
                question,
                optionToCopy.points
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
          const isGraded = Boolean(questionToCopy.graded);
          const question = new CheckboxQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionnaire,
            isGraded
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const optionToCopy of questionToCopy.options!) {
            if (!isGradedInstance(optionToCopy)) {
              break;
            }
            const option = new CheckboxQuestionOption(
              optionToCopy.text,
              question,
              optionToCopy.points
            );
            await option.validateOrReject();
            await transactionalEntityManager.save(option);
          }
        } else if (questionToCopy instanceof MultipleChoiceQuestion) {
          const isGraded = Boolean(questionToCopy.graded);
          const question = new MultipleChoiceQuestion(
            questionToCopy.text,
            questionToCopy.number,
            questionToCopy.optional,
            questionnaire,
            isGraded
          );
          await question.validateOrReject();
          await transactionalEntityManager.save(question);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const optionToCopy of questionToCopy.options!) {
            if (!isGradedInstance(optionToCopy)) {
              break;
            }
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

const isGradedInstance = function (
  obj: NonGradedOption | GradedOption
): obj is GradedOption {
  return "points" in obj;
};

export { addDefaultReviewEvaluationQuestions, addCopyOfQuestions };
