import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity } from "typeorm";

@ChildEntity()
export default class OpenQuestion extends Question {
  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, questionnaire);
  }
}
