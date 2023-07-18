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
  constructor(init?: OpenQuestionInterface) {
    if (init !== undefined) {
      super(init.text, init.number, init.optional, false, init.questionnaire);
    }
  }
}
