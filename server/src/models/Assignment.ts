import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
  RelationId,
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
  IsEnum,
} from "class-validator";
import BaseModel from "./BaseModel";
import Group from "./Group";
import Course from "./Course";
import User from "./User";
import File from "./File";
import moment from "moment";
import UserRole from "../enum/UserRole";
import Submission from "./Submission";
import SubmissionQuestionnaire from "./SubmissionQuestionnaire";
import ReviewQuestionnaire from "./ReviewQuestionnaire";
import { AssignmentState, assignmentStateOrder } from "../enum/AssignmentState";
import _ from "lodash";
import Extensions from "../enum/Extensions";

@Entity()
export default class Assignment extends BaseModel {
  // id SERIAL,
  @PrimaryGeneratedColumn()
  id!: number;

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

  @Column()
  @IsDefined()
  @IsEnum(AssignmentState)
  state: AssignmentState;

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  file: File | null;

  // submission questionaire
  @RelationId((assignment: Assignment) => assignment.submissionQuestionnaire)
  submissionQuestionnaireId?: number; // this is undefined when questionnaire is null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => SubmissionQuestionnaire)
  @JoinColumn()
  submissionQuestionnaire?: SubmissionQuestionnaire | null;

  // review questionaire (for review evaluation)
  @RelationId((assignment: Assignment) => assignment.reviewQuestionnaire)
  reviewQuestionnaireId?: number; // this is undefined when questionnaire is null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => ReviewQuestionnaire)
  @JoinColumn()
  reviewQuestionnaire?: ReviewQuestionnaire | null;

  // external_link varchar(1000),
  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  externalLink: string | null;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Extensions)
  // can be in the form: ".pdf,.zip,.doc,.docx"
  // needs later to be revised to a list of strings
  submissionExtensions: Extensions;

  @RelationId((assignment: Assignment) => assignment.course)
  courseId!: number;
  // course_id int NOT NULL, FK
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Course, (course) => course.assignments, {
    nullable: false,
  })
  course?: Course;

  // Assignment groups
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => Group, (group) => group.assignments)
  groups?: Group[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    externalLink: string | null,
    submissionQuestionnaire: SubmissionQuestionnaire | null,
    reviewQuestionnaire: ReviewQuestionnaire | null,
    submissionExtensions: Extensions
  ) {
    super();
    this.name = name;
    this.course = course;
    this.reviewsPerUser = reviewsPerUser;
    this.enrollable = enrollable;
    this.reviewEvaluation = reviewEvaluation;
    this.state = AssignmentState.UNPUBLISHED; // initial state
    this.publishDate = publishDate;
    this.dueDate = dueDate;
    this.reviewPublishDate = reviewPublishDate;
    this.reviewDueDate = reviewDueDate;
    this.reviewEvaluationDueDate = reviewEvaluationDueDate;
    this.description = description;
    this.file = file;
    this.externalLink = externalLink;
    this.submissionQuestionnaire = submissionQuestionnaire;
    this.reviewQuestionnaire = reviewQuestionnaire;
    this.submissionExtensions = submissionExtensions;
  }

  // custom validation which is run before saving
  validateOrReject(): Promise<void> {
    // check whether the boolean is correctly set
    if (this.reviewEvaluation && !this.reviewEvaluationDueDate) {
      throw new Error("reviewEvaluationDueDate must be defined");
    }
    if (!this.reviewEvaluation && this.reviewEvaluationDueDate) {
      throw new Error(
        "reviewEvaluationDueDate is defined while reviewEvaluation is turned off"
      );
    }
    if (!this.reviewEvaluation && this.reviewQuestionnaire) {
      throw new Error(
        "reviewQuestionnaire is defined while reviewEvaluation is turned off"
      );
    }
    // check chronological order of the dates
    if (
      moment(this.publishDate).isAfter(this.dueDate) ||
      moment(this.dueDate).isAfter(this.reviewPublishDate) ||
      moment(this.reviewPublishDate).isAfter(this.reviewDueDate) ||
      (this.reviewEvaluationDueDate &&
        moment(this.reviewDueDate).isAfter(this.reviewEvaluationDueDate))
    ) {
      throw new Error("The dates must chronologically correct");
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  isAtState(otherState: AssignmentState): boolean {
    return this.state === otherState;
  }

  isAtOrAfterState(otherState: AssignmentState): boolean {
    const currentState = this.state;
    const currentStateIndex = assignmentStateOrder.indexOf(currentState);
    const otherStateIndex = assignmentStateOrder.indexOf(otherState);
    return currentStateIndex >= otherStateIndex;
  }

  isAtOrBeforeState(otherState: AssignmentState): boolean {
    const currentState = this.state;
    const currentStateIndex = assignmentStateOrder.indexOf(currentState);
    const otherStateIndex = assignmentStateOrder.indexOf(otherState);
    return currentStateIndex <= otherStateIndex;
  }

  async getCourse(): Promise<Course> {
    return Course.findOneOrFail(this.courseId);
  }

  async getGroups(): Promise<Group[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Assignment.findOneOrFail(this.id, {
        relations: ["groups"],
      })
    ).groups!;
  }

  async getSubmissionQuestionnaire(): Promise<SubmissionQuestionnaire | null> {
    if (!this.submissionQuestionnaireId) {
      return null;
    } else {
      return SubmissionQuestionnaire.findOneOrFail(
        this.submissionQuestionnaireId
      );
    }
  }

  async getReviewQuestionnaire(): Promise<ReviewQuestionnaire | null> {
    if (!this.reviewQuestionnaireId) {
      return null;
    } else {
      return ReviewQuestionnaire.findOneOrFail(this.reviewQuestionnaireId);
    }
  }

  async getSubmissions(group?: Group): Promise<Submission[]> {
    if (group) {
      return this.getSubmissionsOfGroup(group);
    } else {
      return Submission.find({ where: { assignment: this } });
    }
  }

  async getLatestSubmissionsOfEachGroup(): Promise<Submission[]> {
    const latestSubmissionsOfEachGroup: Submission[] = [];
    const groups = await this.getGroups();
    for (const group of groups) {
      const latestSubmission = await this.getLatestSubmission(group);
      if (latestSubmission) {
        latestSubmissionsOfEachGroup.push(latestSubmission);
      }
    }
    return latestSubmissionsOfEachGroup;
  }

  async getLatestSubmission(group: Group): Promise<Submission | undefined> {
    const submissions = await this.getSubmissions(group);
    const latestSubmission = _.maxBy(submissions, "id");
    return latestSubmission;
  }

  private async getSubmissionsOfGroup(group: Group): Promise<Submission[]> {
    return Submission.find({
      where: {
        assignment: this,
        group: group,
      },
    });
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

  // check whether the assignment is enrollable for a user
  async isEnrollable(user: User): Promise<boolean> {
    // Check whether the user is in the course and not already enrolled
    // plus check whether the assignment is public/enrollable
    if (this.enrollable) {
      // published
      if (this.isAtState(AssignmentState.SUBMISSION)) {
        const course = await this.getCourse();
        if (await course.isEnrolled(user, UserRole.STUDENT)) {
          // not already enrolled in assignment
          if (!(await this.isEnrolledInGroup(user))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // check whether the assignment contains groups
  async hasGroups(): Promise<boolean> {
    return (await this.getGroups()).length > 0;
  }

  // check whether the user is enrolled in this assignment
  async isEnrolledInGroup(user: User): Promise<boolean> {
    return (await this.getGroup(user)) ? true : false;
  }

  async isTeacherInCourse(user: User): Promise<boolean> {
    const course = await this.getCourse();
    return await course.isTeacher(user);
  }

  async isTeacherOrTeachingAssistantInCourse(user: User): Promise<boolean> {
    const course = await this.getCourse();
    return await course.isTeacherOrTeachingAssistant(user);
  }
}
