import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  RelationId,
} from "typeorm";
import { IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "../models/Assignment";
import Group from "./Group";
import File from "./File";

@Entity()
export default class Submission extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  // User_netid varchar(500) NOT NULL,
  @RelationId((submission: Submission) => submission.user)
  userNetid!: number;
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // Group_id int NOT NULL,
  @RelationId((submission: Submission) => submission.group)
  groupId!: number;
  @ManyToOne((_type) => Group, { nullable: false })
  group?: Group;

  // Assignment_id int NOT NULL,
  @RelationId((submission: Submission) => submission.assignment)
  assignmentId!: number;
  @ManyToOne((_type) => Assignment, (assignment) => assignment.submissions, {
    nullable: false,
  })
  assignment?: Assignment;

  // file_path varchar(500) NOT NULL,
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  @IsDefined()
  file: File;

  constructor(user: User, group: Group, assignment: Assignment, file: File) {
    super();
    this.user = user;
    this.group = group;
    this.assignment = assignment;
    this.file = file;
  }

  // validation: check whether the group is in the assingment and the user in the group
  async validateOrReject(): Promise<void> {
    // might need to be changed if a teacher submits on behalf of a group
    if (!(await this.group!.hasUser(this.user!))) {
      throw new Error("User is not part of this group");
    }
    if (!(await this.group!.hasAssignment(this.assignment!))) {
      throw new Error("Group is not part of this assignment");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getGroup(): Promise<Group> {
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["group"],
      })
    ).group!;
  }

  async getAssignment(): Promise<Assignment> {
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["assignment"],
      })
    ).assignment!;
  }

  async getFile(): Promise<File> {
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["file"],
      })
    ).file!;
  }
}
