import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  RelationId,
  ManyToOne,
} from "typeorm";
import { IsDefined, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "./Assignment";
import _ from "lodash";
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
  @ManyToOne((_type) => Course, { nullable: false })
  course?: Course;

  @ManyToMany((_type) => User)
  @JoinTable()
  users?: User[];

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
    if (this.course && this.assignments && this.users) {
      for (const assignment of this.assignments) {
        const course = await assignment.getCourse();
        if (this.course.id !== course.id) {
          throw new Error(
            `Assignment with id ${assignment.id} is not part of course ${this.course.id}`
          );
        }
        // validate that all users are also enrolled in the course
        for (const user of this.users) {
          if (!(await course.isEnrolled(user, UserRole.STUDENT))) {
            throw new Error(`${user.netid} is not enrolled in ${course.id}`);
          }
        }
      }
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getCourse(): Promise<Course> {
    return (
      await Group.findOneOrFail(this.id, {
        relations: ["course"],
      })
    ).course!;
  }

  async getUsers(): Promise<User[]> {
    return (
      await Group.findOneOrFail(this.id, {
        relations: ["users"],
      })
    ).users!;
  }

  async getAssignments(): Promise<Assignment[]> {
    return (
      await Group.findOneOrFail(this.id, {
        relations: ["assignments"],
      })
    ).assignments!;
  }

  async hasUser(user: User): Promise<boolean> {
    const groupUsers = await this.getUsers();
    return _.some(groupUsers, (groupUser) => {
      return groupUser.netid === user.netid;
    });
  }

  async hasAssignment(assignment: Assignment): Promise<boolean> {
    const groupAssignments = await this.getAssignments();
    return _.some(groupAssignments, (groupAssignment) => {
      return groupAssignment.id === assignment.id;
    });
  }

  async isTeacherInCourse(user: User): Promise<boolean> {
    const course = await this.getCourse();
    return await course.isEnrolled(user, UserRole.TEACHER);
  }
}
