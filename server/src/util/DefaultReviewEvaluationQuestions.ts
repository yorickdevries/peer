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

interface QuestionTemplate {
  text: string;
  number: number;
  optional: boolean;
  type: QuestionType;
  range?: number;
  extensions?: string;
  options?: string[];
}
// configuration file
const questionTemplates: QuestionTemplate[] = [
  {
    text:
      "Was the review comprehensive and complete, covering all relevant aspects of the work?",
    number: 1,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["A: Yes", "B: No"],
  },
  {
    text: "Was the input factually correct?",
    number: 2,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "A: Yes, fully",
      "B: Yes, mostly",
      "C: No, mostly not",
      "D: No, not at all",
    ],
  },
  {
    text:
      "Did you, during later revision of the original submission, spot any mistakes that the reviewer overlooked?",
    number: 3,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["A: Yes, major mistakes", "B: Yes, minor mistakes", "C: No"],
  },
  {
    text: "Did the reviewer submit any open feedback (text or pdf)?",
    number: 4,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["A: Yes", "B: No"],
  },
  {
    text: "If there was any open feedback, how much?",
    number: 5,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "A: Too little",
      "B: An acceptable amount",
      "C: Much",
      "D: Not applicable",
    ],
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a clear and understandable way?",
    number: 6,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["A: Yes", "B: No", "C: Not applicable"],
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a constructive way, so giving an idea how to improve the work?",
    number: 7,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: ["A: Yes", "B: No", "C: Not applicable"],
  },
  {
    text: "Overall, do you agree with the reviewer's assessment of the work?",
    number: 8,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      "A: Yes, fully",
      "B: Yes, mostly",
      "C: No, mostly not",
      "D: No, not at all",
    ],
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
    "SERIALIZABLE",
    async (transactionalEntityManager) => {
      // find all groups to check for group existence
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
      for (const questionTemplate of questionTemplates) {
        switch (questionTemplate.type) {
          case QuestionType.CHECKBOX: {
            const question = new CheckboxQuestion(
              questionTemplate.text,
              questionTemplate.number,
              questionTemplate.optional,
              questionnaire
            );
            await transactionalEntityManager.save(question);
            for (const optionTemplate of questionTemplate.options!) {
              const option = new CheckboxQuestionOption(
                optionTemplate,
                question
              );
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.MULTIPLE_CHOICE: {
            const question = new MultipleChoiceQuestion(
              questionTemplate.text,
              questionTemplate.number,
              questionTemplate.optional,
              questionnaire
            );
            await transactionalEntityManager.save(question);
            for (const optionTemplate of questionTemplate.options!) {
              const option = new MultipleChoiceQuestionOption(
                optionTemplate,
                question
              );
              await transactionalEntityManager.save(option);
            }
            break;
          }
          case QuestionType.OPEN: {
            const question = new OpenQuestion(
              questionTemplate.text,
              questionTemplate.number,
              questionTemplate.optional,
              questionnaire
            );
            await transactionalEntityManager.save(question);
            break;
          }
          case QuestionType.RANGE: {
            const question = new RangeQuestion(
              questionTemplate.text,
              questionTemplate.number,
              questionTemplate.optional,
              questionnaire,
              questionTemplate.range!
            );
            await transactionalEntityManager.save(question);
            break;
          }
          case QuestionType.UPLOAD: {
            const question = new UploadQuestion(
              questionTemplate.text,
              questionTemplate.number,
              questionTemplate.optional,
              questionnaire,
              questionTemplate.extensions!
            );
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

export default addDefaultReviewEvaluationQuestions;
