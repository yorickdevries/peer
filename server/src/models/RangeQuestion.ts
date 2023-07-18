import { ChildEntity, Column } from "typeorm";
import { IsDefined, IsInt, IsPositive, Max, Min } from "class-validator";

import Question from "./Question";
import QuestionType from "../enum/QuestionType";
import Questionnaire from "./Questionnaire";
import config from "config";

const rangeconfig: {
  min: number;
  max: number;
} = config.get("rangeQuestion");

interface RangeQuestionInterface {
  text: string;
  number: number;
  optional: boolean;
  questionnaire: Questionnaire;
  range: number;
}

@ChildEntity(QuestionType.RANGE)
export default class RangeQuestion extends Question {
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  @Min(rangeconfig.min) //1 star is the minimum
  @Max(rangeconfig.max) //needs to be checked whats most useful
  range: number;

  constructor(init?: RangeQuestionInterface) {
    if (init !== undefined) {
      super(init.text, init.number, init.optional, false, init.questionnaire);
      this.range = init.range;
    }
  }
}
