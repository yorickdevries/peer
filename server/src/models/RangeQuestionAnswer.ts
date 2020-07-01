import { ChildEntity, Column } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import { IsDefined, IsInt, IsPositive, Min } from "class-validator";
import RangeQuestion from "./RangeQuestion";
import config from "config";

const rangeconfig: {
  min: number;
  max: number;
} = config.get("rangeQuestion");

@ChildEntity(QuestionAnswerType.RANGE)
export default class RangeQuestionAnswer extends QuestionAnswer {
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  @Min(rangeconfig.min) //1 star is the minimum, max is set by the questionmaker (needs validation)
  answer: number;

  constructor(question: RangeQuestion, review: Review, answer: number) {
    super(question, review);
    this.answer = answer;
  }

  // validation: answer should be in range of the question
}
