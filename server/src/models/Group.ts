import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  RelationId,
  ManyToOne,
  getManager,
} from "typeorm";
import { IsDefined, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "./Assignment";
import UserRole from "../enum/UserRole";
import Course from "./Course";

@Entity()
export default class Group extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @RelationId((group: Group) => group.course)
  courseId!: number;
  // course_id int NOT NULL, FK
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Course, { nullable: false })
  course?: Course;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => User, (user) => user.groups)
  @JoinTable()
  users?: User[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => Assignment, (assignment) => assignment.groups)
  @JoinTable()
  assignments?: Assignment[];

  constructor(
    name: string,
    course: Course,
    users: User[],
    assignments: Assignment[]
  ) {
    super();
    this.name = name;
    this.course = course;
    this.users = users;
    this.assignments = assignments;
  }

  async validateOrReject(): Promise<void> {
    const course = this.course ? this.course : await this.getCourse();
    const assignments = this.assignments
      ? this.assignments
      : await this.getAssignments();
    const users = this.users ? this.users : await this.getUsers();
    for (const assignment of assignments) {
      const assignmentCourse = await assignment.getCourse();
      if (course.id !== assignmentCourse.id) {
        throw new Error(
          `Assignment with id ${assignment.id} is not part of course ${course.id}`
        );
      }
      // validate that all users are also enrolled in the course
      for (const user of users) {
        if (!(await course.isEnrolled(user, UserRole.STUDENT))) {
          throw new Error(`${user.netid} is not enrolled in ${course.id}`);
        }
      }
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getCourse(): Promise<Course> {
    return Course.findOneOrFail(this.courseId);
  }

  async getUsers(): Promise<User[]> {
    const users = await getManager()
      .createQueryBuilder(User, "user")
      .leftJoin("user.groups", "group")
      .where("group.id = :id", { id: this.id })
      .getMany();

    return users;
  }

  async getAssignments(): Promise<Assignment[]> {
    const assignments = await getManager()
      .createQueryBuilder(Assignment, "assignment")
      .leftJoin("assignment.groups", "group")
      .where("group.id = :id", { id: this.id })
      .getMany();
    return assignments;
  }

  async hasUser(user: User): Promise<boolean> {
    const groupUser = await getManager()
      .createQueryBuilder(User, "user")
      .leftJoin("user.groups", "group")
      .where("group.id = :id", { id: this.id })
      .andWhere("user.netid = :netid", { netid: user.netid })
      .getOne();
    return groupUser ? true : false;
  }

  async hasAssignment(assignment: Assignment): Promise<boolean> {
    const groupAssignment = await getManager()
      .createQueryBuilder(Assignment, "assignment")
      .leftJoin("assignment.groups", "group")
      .where("group.id = :gid", { gid: this.id })
      .andWhere("assignment.id = :aid", { aid: assignment.id })
      .getOne();
    return groupAssignment ? true : false;
  }

  async isTeacherInCourse(user: User): Promise<boolean> {
    const course = await this.getCourse();
    return await course.isTeacher(user);
  }

  async isTeacherOrTeachingAssistantInCourse(user: User): Promise<boolean> {
    const course = await this.getCourse();
    return await course.isTeacherOrTeachingAssistant(user);
  }
}
