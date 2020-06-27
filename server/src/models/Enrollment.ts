import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Course from "./Course";
import UserRole from "../enum/UserRole";

@Entity()
export default class Enrollment extends BaseModel {
  @PrimaryColumn()
  userNetid?: string;

  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  @PrimaryColumn()
  courseId?: number;

  @ManyToOne((_type) => Course, { nullable: false })
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

  getUser(): Promise<User> {
    return User.findOneOrFail(this.userNetid);
  }

  getCourse(): Promise<Course> {
    return Course.findOneOrFail(this.courseId);
  }
}
