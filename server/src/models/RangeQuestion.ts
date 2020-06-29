import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsDefined, IsInt, IsPositive, Min, Max } from "class-validator";

@ChildEntity(QuestionType.RANGE)
export default class RangeQuestion extends Question {
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  @Min(1) //1 star is the minimum
  @Max(100) //needs to be checked whats most useful
  range: number;

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire,
    range: number
  ) {
    super(text, number, optional, questionnaire);
    this.range = range;
  }
}
