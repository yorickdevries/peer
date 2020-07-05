import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";
import _ from "lodash";

@ChildEntity(QuestionType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestion extends Question {
  @OneToMany(
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
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, questionnaire);
  }

  containsOption(option: MultipleChoiceQuestionOption): boolean {
    return _.some(this.options, (o) => {
      return o.id === option.id;
    });
  }
}
