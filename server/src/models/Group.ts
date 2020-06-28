import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsDefined, IsOptional, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "./Assignment";
import _ from "lodash";

@Entity()
export default class Group extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  id?: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ManyToMany((_type) => User, (user) => user.groups)
  @JoinTable()
  users?: User[];

  @ManyToMany((_type) => Assignment, (assignment) => assignment.groups)
  @JoinTable()
  assignments?: Assignment[];

  constructor(name: string, users: User[], assignments: Assignment[]) {
    super();
    this.name = name;
    this.users = users;
    this.assignments = assignments;
  }

  // validation to check whether all assignments are from he same course
  // TODO: validate that all users are also enrolled in the course
  async validateOrReject(): Promise<void> {
    if (this.assignments) {
      const courseIds = [];
      for (const assignment of this.assignments) {
        const course = await assignment.getCourse();
        courseIds.push(course.id);
      }
      if (_.uniq(courseIds).length > 1) {
        throw "Assignments of a group should be from the same course";
      }
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
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
}
