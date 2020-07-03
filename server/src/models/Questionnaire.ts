import {
  PrimaryGeneratedColumn,
  Entity,
  TableInheritance,
  OneToMany,
  Column,
} from "typeorm";
import BaseModel from "./BaseModel";
import Assignment from "./Assignment";
import Question from "./Question";
import User from "./User";
import QuestionnaireType from "../enum/QuestionnaireType";
import Review from "./Review";

// formely called rubric
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Questionnaire extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  @Column()
  // will be filled in by typeorm with the QuestionnaireType
  type!: QuestionnaireType;

  @OneToMany((_type) => Question, (question) => question.questionnaire, {
    eager: true,
  })
  // all questions (might want to split this later)
  questions!: Question[];

  @OneToMany((_type) => Review, (review) => review.questionnaire)
  reviews?: Review[];

  // commented out as 2 different implementations will break typeORM
  // abstract assignment?: Assignment;

  constructor() {
    super();
  }

  abstract getAssignment(): Promise<Assignment>;

  async getReviews(): Promise<Review[]> {
    return (
      await Questionnaire.findOneOrFail(this.id, {
        relations: ["reviews"],
      })
    ).reviews!;
  }

  // checks whether the user is teacher
  // of the corresponding assignment and course
  async isTeacherInCourse(user: User): Promise<boolean> {
    console.log("hier");
    const assignment = await this.getAssignment();
    console.log(assignment);
    return await assignment.isTeacherInCourse(user);
  }

  async getReviewsWhereUserIsReviewer(user: User): Promise<Review[]> {
    const reviews = await this.getReviews();
    const userReviews: Review[] = [];
    for (const review of reviews) {
      if (await review.isReviewer(user)) {
        userReviews.push(review);
      }
    }
    return userReviews;
  }

  async hasReviewsWhereUserIsReviewer(user: User): Promise<boolean> {
    const reviews = await this.getReviewsWhereUserIsReviewer(user);
    return reviews.length > 0;
  }
}
