import { ChildEntity, Column } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from "class-validator";
import OpenQuestion from "./OpenQuestion";

@ChildEntity(QuestionAnswerType.OPEN)
export default class OpenQuestionAnswer extends QuestionAnswer {
  // answer varchar(100000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  openAnswer: string;

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

  constructor(question: OpenQuestion, review: Review, answer: string) {
    super(question, review);
    this.openAnswer = answer;
    this.maxWordCount = question.maxWordCount;
    this.minWordCount = question.minWordCount;
  }

  async getQuestion(): Promise<OpenQuestion> {
    const questionId = this.question ? this.question.id : this.questionId;
    return OpenQuestion.findOneOrFail(questionId);
  }

  getAnswerText(): string {
    return this.openAnswer;
  }

  async getAnswerPoints(): Promise<undefined> {
    //To be implemented in future when OpenQuestions become graded
    const question = await this.getQuestion();
    if (!question.graded) {
      return undefined;
    } else {
      throw new Error("The question is a graded question");
    }
  }
}
