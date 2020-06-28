import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
} from "typeorm";
import {
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsInt,
  IsPositive,
  IsDate,
  IsUrl,
} from "class-validator";
import BaseModel from "./BaseModel";
import Group from "./Group";
import Course from "./Course";
import User from "./User";
import File from "./File";
import moment from "moment";
import UserRole from "../enum/UserRole";
import Submission from "./Submission";
import assignmentState from "../enum/assignmentState";

@Entity()
export default class Assignment extends BaseModel {
  // id SERIAL,
  @PrimaryGeneratedColumn()
  @IsOptional()
  id?: number;

  // title varchar(500) NOT NULL,
  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  // reviews_per_user int NOT NULL,
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  reviewsPerUser: number;

  // one_person_groups boolean NOT NULL,
  @Column()
  @IsDefined()
  @IsBoolean()
  enrollable: boolean;

  // review_evaluation boolean NOT NULL,
  @Column()
  @IsDefined()
  @IsBoolean()
  reviewEvaluation: boolean;

  // publish_date timestamptz NOT NULL,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsDefined()
  @IsDate()
  publishDate: Date;

  // due_date timestamptz NOT NULL,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsDefined()
  @IsDate()
  dueDate: Date;

  // review_publish_date timestamptz NOT NULL,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsDefined()
  @IsDate()
  reviewPublishDate: Date;

  // review_due_date timestamptz NOT NULL,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsDefined()
  @IsDate()
  reviewDueDate: Date;

  // review_evaluation_due_date timestamptz,
  @Column({
    type: process.env.NODE_ENV === "test" ? "datetime" : "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  reviewEvaluationDueDate: Date | null;

  // description varchar(5000),
  @Column("text", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string | null;

  // filename varchar(500),
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  file: File | null;

  // external_link varchar(1000),
  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  externalLink: string | null;

  // course_id int NOT NULL, FK
  @ManyToOne((_type) => Course, (course) => course.assignments, {
    nullable: false,
  })
  course?: Course;

  // Assignment groups
  @ManyToMany((_type) => Group, (group) => group.assignments)
  groups?: Group[];

  @OneToMany((_type) => Submission, (submission) => submission.assignment)
  submissions?: Submission[];

  constructor(
    name: string,
    course: Course,
    reviewsPerUser: number,
    enrollable: boolean,
    reviewEvaluation: boolean,
    publishDate: Date,
    dueDate: Date,
    reviewPublishDate: Date,
    reviewDueDate: Date,
    reviewEvaluationDueDate: Date | null,
    description: string | null,
    file: File | null,
    externalLink: string | null
  ) {
    super();
    this.name = name;
    this.course = course;
    this.reviewsPerUser = reviewsPerUser;
    this.enrollable = enrollable;
    this.reviewEvaluation = reviewEvaluation;
    this.publishDate = publishDate;
    this.dueDate = dueDate;
    this.reviewPublishDate = reviewPublishDate;
    this.reviewDueDate = reviewDueDate;
    this.reviewEvaluationDueDate = reviewEvaluationDueDate;
    this.description = description;
    this.file = file;
    this.externalLink = externalLink;
  }

  // custom validation which is run before saving
  validateOrReject(): Promise<void> {
    // check whether the boolean is correctly set
    if (this.reviewEvaluation && !this.reviewEvaluationDueDate) {
      throw "reviewEvaluationDueDate must be defined";
    }
    if (!this.reviewEvaluation && this.reviewEvaluationDueDate) {
      throw "reviewEvaluationDueDate is defined while reviewEvaluation is turned off";
    }
    // check chronological order of the dates
    if (
      moment(this.publishDate).isAfter(this.dueDate) ||
      moment(this.dueDate).isAfter(this.reviewPublishDate) ||
      moment(this.reviewPublishDate).isAfter(this.reviewDueDate) ||
      (this.reviewEvaluationDueDate &&
        moment(this.reviewDueDate).isAfter(this.reviewEvaluationDueDate))
    ) {
      throw "The dates must chronologically correct";
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  // check whether the user is enrolled in this assignment
  getState(): assignmentState {
    if (moment().isBefore(this.publishDate)) {
      return assignmentState.UNPUBLISHED;
    } else if (moment().isBefore(this.dueDate)) {
      return assignmentState.SUBMISSION;
    } else if (moment().isBefore(this.reviewPublishDate)) {
      return assignmentState.WAITINGFORREVIEW;
    } else if (moment().isBefore(this.reviewDueDate)) {
      return assignmentState.REVIEW;
    } else {
      return assignmentState.FEEDBACK;
    }
  }

  async getCourse(): Promise<Course> {
    return (
      await Assignment.findOneOrFail(this.id, {
        relations: ["course"],
      })
    ).course!;
  }

  async getGroups(): Promise<Group[]> {
    return (
      await Assignment.findOneOrFail(this.id, {
        relations: ["groups"],
      })
    ).groups!;
  }

  async getSubmissions(group?: Group): Promise<Submission[]> {
    if (group) {
      return this.getSubmissionsOfGroup(group);
    } else {
      return (
        await Assignment.findOneOrFail(this.id, {
          relations: ["submissions"],
        })
      ).submissions!;
    }
  }

  private async getSubmissionsOfGroup(group: Group): Promise<Submission[]> {
    const allSubmissions = await this.getSubmissions();
    const submissionsOfGroup = [];
    for (const submission of allSubmissions) {
      const submissionGroup = await submission.getGroup();
      if (submissionGroup.id === group.id) {
        submissionsOfGroup.push(submission);
      }
    }
    return submissionsOfGroup;
  }

  async getGroup(user: User): Promise<Group | undefined> {
    const groups = await this.getGroups();
    for (const group of groups) {
      if (await group.hasUser(user)) {
        return group;
      }
    }
    return undefined;
  }

  // check whether the user is enrolled in this assignment
  async isEnrollable(user: User): Promise<boolean> {
    // Check whether the user is in the course and not already enrolled
    // plus check whether the assignment is public/enrollable
    if (this.enrollable) {
      // published
      if (this.getState() === assignmentState.SUBMISSION) {
        const course = await this.getCourse();
        if (await course.isEnrolled(user, UserRole.STUDENT)) {
          //enrolledInCourse
          // not already enrolled in assignment
          if (!(await this.isEnrolled(user))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // check whether the user is enrolled in this assignment
  async isEnrolled(user: User): Promise<boolean> {
    return (await this.getGroup(user)) ? true : false;
  }
}
