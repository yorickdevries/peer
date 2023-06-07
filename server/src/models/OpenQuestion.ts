import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsDefined, IsInt, IsPositive } from "class-validator";

@ChildEntity(QuestionType.OPEN)
export default class OpenQuestion extends Question {
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  minWordCount: number;

  @Column()
  @IsDefined()
  @IsInt()
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
