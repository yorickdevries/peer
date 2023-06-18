import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsDefined, IsPositive } from "class-validator";

@ChildEntity(QuestionType.OPEN)
export default class OpenQuestion extends Question {
  @Column({ type: "bigint", unsigned: true })
  @IsDefined()
  @IsPositive()
  minWordCount: number;

  @Column({ type: "bigint", unsigned: true })
  @IsDefined()
  @IsPositive()
  maxWordCount: number;
  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire,
    maxWordCount: number,
    minWordCount: number
  ) {
    super(text, number, optional, false, questionnaire);
    this.maxWordCount = maxWordCount;
    this.minWordCount = minWordCount;
  }
}
