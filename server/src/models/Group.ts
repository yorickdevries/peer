import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "./Assignment";
import UserRole from "../enum/UserRole";
import Course from "./Course";
import { dataSource } from "../databaseConnection";

interface GroupInterface {
  name: string;
  course: Course;
  users: User[];
  assignments: Assignment[];
}
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

  init(init: GroupInterface) {
    this.name = init.name;
    this.course = init.course;
    this.users = init.users;
    this.assignments = init.assignments;
    return this;
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
    return Course.findOneByOrFail({
      id: this.courseId,
    });
  }

  async getUsers(): Promise<User[]> {
    const users = await dataSource.manager
      .createQueryBuilder(User, "user")
      .leftJoin("user.groups", "group")
      .where("group.id = :id", { id: this.id })
      .getMany();
    // reload all to get eager fields
    for (const user of users) {
      await user.reload();
    }
    return users;
  }

  async getAssignments(): Promise<Assignment[]> {
    const assignments = await dataSource.manager
      .createQueryBuilder(Assignment, "assignment")
      .leftJoin("assignment.groups", "group")
      .where("group.id = :id", { id: this.id })
      .getMany();
    // reload all to get eager fields
    for (const assignment of assignments) {
      await assignment.reload();
    }
    return assignments;
  }

  async hasUser(user: User): Promise<boolean> {
    const groupUser = await dataSource.manager
      .createQueryBuilder(User, "user")
      .leftJoin("user.groups", "group")
      .where("group.id = :id", { id: this.id })
      .andWhere("user.netid = :netid", { netid: user.netid })
      .getOne();
    return groupUser ? true : false;
  }

  async hasAssignment(assignment: Assignment): Promise<boolean> {
    const groupAssignment = await dataSource.manager
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
