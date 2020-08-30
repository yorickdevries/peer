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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // Group_id int NOT NULL,
  @RelationId((submission: Submission) => submission.group)
  groupId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Group, { nullable: false })
  group?: Group;

  // Assignment_id int NOT NULL,
  @RelationId((submission: Submission) => submission.assignment)
  assignmentId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Assignment, (assignment) => assignment.submissions, {
    nullable: false,
  })
  assignment?: Assignment;

  // file_path varchar(500) NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  @IsDefined()
  file: File;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // check if the file has the right extension
    if (
      !assignment.submissionExtensions.split(",").includes(this.file.extension)
    ) {
      throw new Error("The file is of the wrong extension");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getGroup(): Promise<Group> {
    return Group.findOneOrFail(this.groupId);
  }

  async getAssignment(): Promise<Assignment> {
    return Assignment.findOneOrFail(this.assignmentId);
  }

  async getUser(): Promise<User> {
    return User.findOneOrFail(this.userNetid);
  }

  async getReviewOfSubmissions(): Promise<ReviewOfSubmission[]> {
    return ReviewOfSubmission.find({ where: { submission: this } });
  }
}
