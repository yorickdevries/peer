import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity } from "typeorm";
import QuestionType from "../enum/QuestionType";

interface OpenQuestionInterface {
  text: string;
  number: number;
  optional: boolean;
  questionnaire: Questionnaire;
}

@ChildEntity(QuestionType.OPEN)
export default class OpenQuestion extends Question {

  init(init: OpenQuestionInterface) {
    this.text = init.text;
    this.number = init.number;
    this.optional = init.optional;
    this.graded = false;
    this.questionnaire = init.questionnaire;
    return this;
  }
}
