import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity } from "typeorm";
import QuestionType from "../enum/QuestionType";

@ChildEntity(QuestionType.CHECKBOX)
export default class CheckboxQuestion extends Question {
  // to be added: options

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, questionnaire);
  }
}
