import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Course from "./Course";
import UserRole from "../enum/UserRole";

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
  role: UserRole;

  constructor(user: User, course: Course, role: UserRole) {
    super();
    this.user = user;
    this.course = course;
    this.role = role;
  }
}
