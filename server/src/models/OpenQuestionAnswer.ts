import { ChildEntity, Column } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import OpenQuestion from "./OpenQuestion";

@ChildEntity(QuestionAnswerType.OPEN)
export default class OpenQuestionAnswer extends QuestionAnswer {
  // answer varchar(100000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  openAnswer: string;

  constructor(question: OpenQuestion, review: Review, answer: string) {
    super(question, review);
    this.openAnswer = answer;
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

  async isInWordRange(): Promise<boolean> {
    const openQuestion: OpenQuestion = await this.getQuestion();

    return (
      this.openAnswer !== null &&
      this.numberOfWords() >= openQuestion.minWordCount &&
      this.numberOfWords() <= openQuestion.maxWordCount
    );
  }

  private numberOfWords(): number {
    return this.openAnswer.split(" ").length;
  }
}
