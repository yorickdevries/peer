import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsInt, IsPositive, Max } from "class-validator";
import ResponseMessage from "../enum/ResponseMessage";

@ChildEntity(QuestionType.OPEN)
export default class OpenQuestion extends Question {
  @Column({ default: 20000 })
  @IsInt()
  @IsPositive()
  @Max(20000)
  minWordCount: number;

  @Column({ default: 20000 })
  @IsInt()
  @IsPositive()
  @Max(20000)
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

  async validateOrReject(): Promise<void> {
    if (this.minWordCount > this.maxWordCount || this.minWordCount < 0) {
      throw new Error(ResponseMessage.INVALID_WORD_COUNT);
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }
}
