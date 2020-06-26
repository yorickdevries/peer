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
  users: User[];

  @ManyToMany((_type) => Assignment, (assignment) => assignment.groups)
  @JoinTable()
  assignments: Assignment[];

  constructor(name: string, users: User[], assignments: Assignment[]) {
    super();
    this.name = name;
    this.users = users;
    this.assignments = assignments;
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
