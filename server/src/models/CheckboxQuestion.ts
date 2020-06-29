import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import CheckboxQuestionOption from "./CheckboxQuestionOption";

@ChildEntity(QuestionType.CHECKBOX)
export default class CheckboxQuestion extends Question {
  @OneToMany(
    (_type) => CheckboxQuestionOption,
    (checkboxQuestionOption) => checkboxQuestionOption.question
  )
  options?: CheckboxQuestionOption[];

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, questionnaire);
  }
}
