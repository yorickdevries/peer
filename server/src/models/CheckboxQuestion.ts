import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import CheckboxQuestionOption from "./CheckboxQuestionOption";

@ChildEntity(QuestionType.CHECKBOX)
export default class CheckboxQuestion extends Question {
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => CheckboxQuestionOption,
    (checkboxQuestionOption) => checkboxQuestionOption.question,
    {
      eager: true,
    }
  )
  options!: CheckboxQuestionOption[];

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, questionnaire);
  }

  containsOption(option: CheckboxQuestionOption): boolean {
    return this.id === option.questionId;
  }
}
