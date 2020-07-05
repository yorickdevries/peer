import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import CheckboxQuestionOption from "./CheckboxQuestionOption";
import _ from "lodash";

@ChildEntity(QuestionType.CHECKBOX)
export default class CheckboxQuestion extends Question {
  @OneToMany(
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
    return _.some(this.options, (o) => {
      return o.id === option.id;
    });
  }
}
