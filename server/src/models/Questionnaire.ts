import {
  PrimaryGeneratedColumn,
  Entity,
  TableInheritance,
  OneToMany,
} from "typeorm";
import { IsOptional } from "class-validator";
import BaseModel from "./BaseModel";
import Assignment from "./Assignment";
import Question from "./Question";
import User from "./User";

// formely called rubric
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Questionnaire extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  @OneToMany((_type) => Question, (question) => question.questionnaire)
  // all questions (might want to split this later)
  questions?: Question[];

  abstract assignment?: Assignment;

  constructor() {
    super();
  }

  abstract getAssignment(): Promise<Assignment>;

  // checks whether the user is teacher
  // of the corresponding assignment and course
  async isTeacherOfCourse(user: User): Promise<boolean> {
    const assignment = await this.getAssignment();
    return await assignment.isTeacherOfCourse(user);
  }
}
