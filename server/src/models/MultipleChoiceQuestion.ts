import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

@ChildEntity(QuestionType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestion extends Question {
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => MultipleChoiceQuestionOption,
    (multipleChoiceQuestionOption) => multipleChoiceQuestionOption.question,
    {
      eager: true,
    }
  )
  options!: MultipleChoiceQuestionOption[];

  constructor(
    text: string,
    number: number,
    optional: boolean,
    graded: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, graded, questionnaire);
  }

  containsOption(option: MultipleChoiceQuestionOption): boolean {
    return this.id === option.questionId;
  }
}
