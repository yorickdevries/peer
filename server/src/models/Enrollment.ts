import { Entity, PrimaryColumn, Column, ManyToOne, RelationId } from "typeorm";
import { IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Course from "./Course";
import UserRole from "../enum/UserRole";

@Entity()
export default class Enrollment extends BaseModel {
  // length of max 191 due to UTF-8MB4 encoding of strings
  @PrimaryColumn({ length: 63 })
  @RelationId((enrollment: Enrollment) => enrollment.user)
  userNetid!: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  @PrimaryColumn()
  @RelationId((enrollment: Enrollment) => enrollment.course)
  courseId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
}
