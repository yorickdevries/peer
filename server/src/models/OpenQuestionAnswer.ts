import { ChildEntity, Column } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import OpenQuestion from "./OpenQuestion";

interface OpenQuestionAnswerInterface {
  question: OpenQuestion;
  review: Review;
  answer: string;
}

@ChildEntity(QuestionAnswerType.OPEN)
export default class OpenQuestionAnswer extends QuestionAnswer {
  // answer varchar(100000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  openAnswer: string;

  constructor(init?: OpenQuestionAnswerInterface) {
    if (init !== undefined) {
      super({ question: init.question, review: init.review });
      this.openAnswer = init.answer;
    }
  }

  async getQuestion(): Promise<OpenQuestion> {
    const questionId = this.question ? this.question.id : this.questionId;
    return OpenQuestion.findOneByOrFail({
      id: questionId,
    });
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
