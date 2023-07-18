import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { IsDefined, IsEnum } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Course from "./Course";
import UserRole from "../enum/UserRole";

interface EnrollmentInterface {
  user: User;
  course: Course;
  role: UserRole;
}

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
  @IsEnum(UserRole)
  role: UserRole;

  constructor(init?: EnrollmentInterface) {
    if (init !== undefined) {
      super();
      this.user = init.user;
      this.course = init.course;
      this.role = init.role;
    }
  }

  async getUser(): Promise<User> {
    return User.findOneByOrFail({
      netid: this.userNetid,
    });
  }
}
