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
  rangeAnswer: number;

  constructor(question: RangeQuestion, review: Review, answer: number) {
    super(question, review);
    this.rangeAnswer = answer;
  }

  // validation: answer should be in range of the question
  async validateOrReject(): Promise<void> {
    // validation: questions should be part of the questionnaire of the review
    const question = await this.getQuestion();
    if (question.range < this.rangeAnswer) {
      throw new Error("The answer is outside the range");
    }
    // all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getQuestion(): Promise<RangeQuestion> {
    const questionId = this.question ? this.question.id : this.questionId;
    return RangeQuestion.findOneOrFail(questionId);
  }

  getAnswerText(): string {
    return String(this.rangeAnswer);
  }

  getAnswerPoints(): number[] {
    //To be implemented in future when RangeQuestions become graded
    return [];
  }
}
