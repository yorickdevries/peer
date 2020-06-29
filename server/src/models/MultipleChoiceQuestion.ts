import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

@ChildEntity(QuestionType.MULTIPLECHOICE)
export default class MultipleChoiceQuestion extends Question {
  @OneToMany(
    (_type) => MultipleChoiceQuestionOption,
    (multipleChoiceQuestionOption) => multipleChoiceQuestionOption.question
  )
  options?: MultipleChoiceQuestionOption[];

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, questionnaire);
  }
}
