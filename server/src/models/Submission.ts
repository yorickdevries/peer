import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  RelationId,
  OneToMany,
} from "typeorm";
import { IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "../models/Assignment";
import Group from "./Group";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";

@Entity()
export default class Submission extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  // User_netid varchar(500) NOT NULL,
  @RelationId((submission: Submission) => submission.user)
  userNetid!: string;
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

  @OneToMany(
    (_type) => ReviewOfSubmission,
    (reviewOfSubmission) => reviewOfSubmission.submission
  )
  reviewOfSubmissions?: ReviewOfSubmission[];

  constructor(user: User, group: Group, assignment: Assignment, file: File) {
    super();
    this.user = user;
    this.group = group;
    this.assignment = assignment;
    this.file = file;
  }

  // validation: check whether the group is in the assingment and the user in the group
  async validateOrReject(): Promise<void> {
    const group = this.group ? this.group : await this.getGroup();
    const user = this.user ? this.user : await this.getUser();
    const assignment = this.assignment
      ? this.assignment
      : await this.getAssignment();
    // might need to be changed if a teacher submits on behalf of a group
    if (!(await group.hasUser(user))) {
      throw new Error("User is not part of this group");
    }
    if (!(await group.hasAssignment(assignment))) {
      throw new Error("Group is not part of this assignment");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getGroup(): Promise<Group> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["group"],
      })
    ).group!;
  }

  async getAssignment(): Promise<Assignment> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["assignment"],
      })
    ).assignment!;
  }

  async getUser(): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["user"],
      })
    ).user!;
  }

  async getReviewOfSubmissions(): Promise<ReviewOfSubmission[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Submission.findOneOrFail(this.id, {
        relations: ["reviewOfSubmissions"],
      })
    ).reviewOfSubmissions!;
  }
}
