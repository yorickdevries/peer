import {
  Column,
  Entity,
  TableInheritance,
  PrimaryColumn,
  RelationId,
  ManyToOne,
} from "typeorm";
import BaseModel from "./BaseModel";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import Question from "./Question";
import Review from "./Review";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class QuestionAnswer extends BaseModel {
  @Column()
  // will be filled in by typeorm with the QuestionAnswerType
  type!: QuestionAnswerType;

  // Question_id int NOT NULL,
  @PrimaryColumn()
  @RelationId((questionAnswer: QuestionAnswer) => questionAnswer.question)
  questionId!: number;
  @ManyToOne((_type) => Question, { nullable: false })
  question?: Question;

  // Review_id int NOT NULL,
  @PrimaryColumn()
  @RelationId((questionAnswer: QuestionAnswer) => questionAnswer.review)
  reviewId!: number;
  @ManyToOne((_type) => Review, (review) => review.questionAnswers, {
    nullable: false,
  })
  review?: Review;

  // enforce adding getquestion route
  abstract getQuestion(): Promise<Question>;

  // method to get string representation of the answer
  abstract getAnswerText(): string;

  constructor(question: Question, review: Review) {
    super();
    this.question = question;
    this.review = review;
  }

  async validateOrReject(): Promise<void> {
    // validation: questions should be part of the questionnaire of the review
    const question = await this.getQuestion();
    const review = await this.getReview();
    const questionnaire = await review.getQuestionnaire();
    if (!questionnaire.containsQuestion(question)) {
      throw new Error("The question is not part of this review");
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getReview(): Promise<Review> {
    if (this.review) {
      return this.review;
    } else {
      return await Review.findOneOrFail(this.reviewId);
    }
  }
}
