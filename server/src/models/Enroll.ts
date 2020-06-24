import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { IsDefined, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Course from "./Course";

@Entity()
export default class Enroll extends BaseModel {
  @PrimaryColumn()
  userNetid?: string;

  @ManyToOne((_type) => User)
  user?: User;

  @PrimaryColumn()
  courseId?: number;

  @ManyToOne((_type) => Course)
  course?: Course;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  role: string;

  constructor(user: User, course: Course, role: string) {
    super();
    this.user = user;
    this.course = course;
    this.role = role;
  }
}
