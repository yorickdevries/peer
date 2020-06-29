import { ChildEntity, Column } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import { IsDefined, IsInt, IsPositive, Min } from "class-validator";
import RangeQuestion from "./RangeQuestion";

@ChildEntity(QuestionAnswerType.RANGE)
export default class RangeQuestionAnswer extends QuestionAnswer {
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  @Min(1) //1 star is the minimum
  answer: number;

  constructor(question: RangeQuestion, review: Review, answer: number) {
    super(question, review);
    this.answer = answer;
  }
}
