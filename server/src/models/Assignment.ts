import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  ManyToMany,
  JoinColumn,
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
import _ from "lodash";

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

  async getGroup(user: User): Promise<Group | undefined> {
    const groups = await this.getGroups();
    for (const group of groups) {
      const groupUsers = await group.getUsers();
      if (
        _.some(groupUsers, (groupUser) => {
          return groupUser.netid === user.netid;
        })
      ) {
        return group;
      }
    }
    return undefined;
  }

  // // get all enrollable assignments for a certain user
  // static async getEnrollableAssignments(user: User): Promise<Assignment[]> {
  //   // all enrollable published assignments
  //   const allEnrollableAssignments = await this.find({
  //     where: {
  //       enrollable: true,
  //       publishDate: LessThan(new Date()),
  //     },
  //   });
  //   // pick the assignments of courses the student is enrolled in
  //   // and where the student is not part of a group yet
  //   const enrollableAssignments = [];
  //   for (const assignment of allEnrollableAssignments) {
  //     const course = await assignment.getCourse();
  //     const studentInCourse = await course.isEnrolled(user, UserRole.STUDENT);
  //     const enrolledInAssignment = await assignment.isEnrolled(user);
  //     if (studentInCourse && !enrolledInAssignment) {
  //       enrollableAssignments.push(assignment);
  //     }
  //   }
  //   return enrollableAssignments;
  // }

  // check whether the user is enrolled in this assignment
  async isEnrollable(user: User): Promise<boolean> {
    // Check whether the user is in the course and not already enrolled
    // plus check whether the assignment is public/enrollable
    if (this.enrollable) {
      // published
      if (
        moment().isAfter(this.publishDate) &&
        moment().isBefore(this.dueDate)
      ) {
        const course = await this.getCourse();
        if (await course.isEnrolled(user)) {
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

  // // get all enrolled assignments for a user
  // static async getEnrolled(user: User): Promise<Assignment[]> {
  //   const userGroups = await user.getGroups();

  //   const assignments = [];
  //   for (const group of userGroups) {
  //     for (const assignment of await group.getAssignments()) {
  //       assignments.push(assignment);
  //     }
  //   }
  //   // map the groups to a list of assignments
  //   const enrolledAssignments = _.unionBy(assignments, "id");
  //   return enrolledAssignments;
  // }

  // check whether the user is enrolled in this assignment
  async isEnrolled(user: User): Promise<boolean> {
    return (await this.getGroup(user)) ? true : false;
  }
}
