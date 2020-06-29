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
  type?: QuestionAnswerType;

  // Question_id int NOT NULL,
  @PrimaryColumn()
  @RelationId((questionAnswer: QuestionAnswer) => questionAnswer.question)
  questionId?: string;
  @ManyToOne((_type) => Question, { nullable: false })
  question?: Question;

  // Review_id int NOT NULL,
  @PrimaryColumn()
  @RelationId((questionAnswer: QuestionAnswer) => questionAnswer.review)
  reviewId?: string;
  @ManyToOne((_type) => Review, { nullable: false })
  review?: Review;

  constructor(question: Question, review: Review) {
    super();
    this.question = question;
    this.review = review;
  }
}
