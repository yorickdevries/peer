import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { IsOptional, IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "../models/Assignment";
import Group from "./Group";

@Entity()
export default class Submission extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  // User_netid varchar(500) NOT NULL,
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // Group_id int NOT NULL,
  @ManyToOne((_type) => Group, { nullable: false })
  group?: Group;

  // Assignment_id int NOT NULL,
  @ManyToOne((_type) => Assignment, { nullable: false })
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

  // user
  async getUser(): Promise<User> {
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["user"],
      })
    ).user!;
  }

  //group
  async getGroup(): Promise<Group> {
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["group"],
      })
    ).group!;
  }

  //assignment
  async getAssignment(): Promise<Assignment> {
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["assignment"],
      })
    ).assignment!;
  }
}
