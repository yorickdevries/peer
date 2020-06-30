import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsDefined, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "./Assignment";
import _ from "lodash";

@Entity()
export default class Group extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ManyToMany((_type) => User)
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

  async validateOrReject(): Promise<void> {
    // checking whether the students are enrolled in the course is skipped
    // as this enrollment is done in an transaction and ca therefore not be checked here
    // so every time a course is saved, this needs to be checked separately
    if (this.assignments) {
      const courseIds = [];
      for (const assignment of this.assignments) {
        courseIds.push(assignment.courseId);
      }
      // validation to check whether all assignments are from the same course
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
}
