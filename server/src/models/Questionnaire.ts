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
import _ from "lodash";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => Question, (question) => question.questionnaire, {
    eager: true,
  })
  // all questions (might want to split this later)
  questions!: Question[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => Review, (review) => review.questionnaire)
  reviews?: Review[];

  constructor() {
    super();
  }

  abstract getAssignment(): Promise<Assignment>;

  async getReviews(submitted?: boolean): Promise<Review[]> {
    const where: {
      questionnaire: Questionnaire;
      submitted?: boolean;
    } = {
      questionnaire: this,
    };
    if (submitted !== undefined) {
      where.submitted = submitted;
    }
    return await Review.find({ where: where });
  }

  // checks whether the user is teacher
  // of the corresponding assignment and course
  async isTeacherInCourse(user: User): Promise<boolean> {
    const assignment = await this.getAssignment();
    return await assignment.isTeacherInCourse(user);
  }

  async isTeacherOrTeachingAssistantInCourse(user: User): Promise<boolean> {
    const assignment = await this.getAssignment();
    return await assignment.isTeacherOrTeachingAssistantInCourse(user);
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

  containsQuestion(question: Question): boolean {
    return _.some(this.questions, (q) => {
      return q.id === question.id;
    });
  }
}
