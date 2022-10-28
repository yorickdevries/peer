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
  getManager,
} from "typeorm";
import {
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
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
import { AssignmentState, assignmentStateOrder } from "../enum/AssignmentState";
import AssignmentType from "../enum/AssignmentType";
import AssignmentExport from "./AssignmentExport";
import AssignmentVersion from "./AssignmentVersion";

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
  @Column({ type: "timestamp" })
  @IsDefined()
  @IsDate()
  publishDate: Date;

  // due_date timestamptz NOT NULL,
  @Column({ type: "timestamp" })
  @IsDefined()
  @IsDate()
  dueDate: Date;

  // review_publish_date timestamptz NOT NULL,
  @Column({ type: "timestamp" })
  @IsDefined()
  @IsDate()
  reviewPublishDate: Date;

  // review_due_date timestamptz NOT NULL,
  @Column({ type: "timestamp" })
  @IsDefined()
  @IsDate()
  reviewDueDate: Date;

  // review_evaluation_due_date timestamptz,
  @Column({
    type: "timestamp",
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

  // external_link varchar(1000),
  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  externalLink: string | null;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => AssignmentVersion,
    (assignmentVersion) => assignmentVersion.assignment,
    { eager: true }
  )
  versions!: AssignmentVersion[];

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  // can be in the form: ".pdf,.zip,.doc,.docx"
  // needs later to be revised to a list of strings
  submissionExtensions: string;

  @Column()
  @IsDefined()
  @IsBoolean()
  // indicates whether feedback should be blocked for students with unsubmitted reviews
  blockFeedback: boolean;

  @Column()
  @IsDefined()
  @IsBoolean()
  // enables making submissions after the due date
  lateSubmissions: boolean;

  @Column()
  @IsDefined()
  @IsBoolean()
  // enables making submissionreviews after the due date
  lateSubmissionReviews: boolean;

  @Column("boolean", { nullable: true })
  @IsOptional()
  @IsBoolean()
  // enables making review evaluations after the due date
  lateReviewEvaluations: boolean | null;

  @Column()
  @IsDefined()
  @IsBoolean()
  // lets the teacher set the possibillity to automatically progress to the next states of assignments
  automaticStateProgression: boolean;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEnum(AssignmentType)
  // lets the teacher choose the assignment type
  assignmentType: AssignmentType;

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

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => AssignmentExport,
    (assignmentExport) => assignmentExport.assignment
  )
  assignmentExports?: AssignmentExport[];

  constructor(
    name: string,
    course: Course,
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
    submissionExtensions: string,
    blockFeedback: boolean,
    lateSubmissions: boolean,
    lateSubmissionReviews: boolean,
    lateReviewEvaluations: boolean | null,
    automaticStateProgression: boolean,
    assignmentType: AssignmentType
  ) {
    super();
    this.name = name;
    this.course = course;
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
    this.submissionExtensions = submissionExtensions;
    this.blockFeedback = blockFeedback;
    this.lateSubmissions = lateSubmissions;
    this.lateSubmissionReviews = lateSubmissionReviews;
    this.lateReviewEvaluations = lateReviewEvaluations;
    this.automaticStateProgression = automaticStateProgression;
    this.assignmentType = assignmentType;
  }

  // custom validation which is run before saving
  validateOrReject(): Promise<void> {
    // check whether the boolean is correctly set
    if (
      this.reviewEvaluation &&
      (!this.reviewEvaluationDueDate || this.lateReviewEvaluations === null)
    ) {
      throw new Error(
        "reviewEvaluationDueDate/lateReviewEvaluations must be defined"
      );
    }
    if (
      !this.reviewEvaluation &&
      (this.reviewEvaluationDueDate || this.lateReviewEvaluations !== null)
    ) {
      throw new Error(
        "reviewEvaluationDueDate is defined while reviewEvaluation is turned off"
      );
    }
    if (!this.reviewEvaluation) {
      // check whether this.versions is initialized
      if (this.versions) {
        for (const assignmentVersion of this.versions) {
          if (
            assignmentVersion.reviewQuestionnaire ||
            assignmentVersion.reviewQuestionnaireId
          ) {
            throw new Error(
              "reviewQuestionnaire is defined while reviewEvaluation is turned off"
            );
          }
        }
      }
    }
    // check chronological order of the dates
    // the dates must be at least 15 minutes apart from echother
    if (
      moment(this.publishDate).add(15, "minutes").isAfter(this.dueDate) ||
      moment(this.dueDate).add(15, "minutes").isAfter(this.reviewPublishDate) ||
      moment(this.reviewPublishDate)
        .add(15, "minutes")
        .isAfter(this.reviewDueDate) ||
      (this.reviewEvaluationDueDate &&
        moment(this.reviewDueDate)
          .add(15, "minutes")
          .isAfter(this.reviewEvaluationDueDate))
    ) {
      throw new Error(
        "The dates must chronologically correct and at least 15 minutes apart"
      );
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
    const groups = await getManager()
      .createQueryBuilder(Group, "group")
      .leftJoin("group.assignments", "assignment")
      .where("assignment.id = :id", { id: this.id })
      .getMany();
    // reload all to get eager fields
    for (const group of groups) {
      await group.reload();
    }
    return groups;
  }

  async getGroup(user: User): Promise<Group | undefined> {
    const group = await getManager()
      .createQueryBuilder(Group, "group")
      .leftJoin("group.assignments", "assignment")
      .leftJoin("group.users", "user")
      .where("assignment.id = :id", { id: this.id })
      .andWhere("user.netid = :netid", { netid: user.netid })
      .getOne();
    if (group) {
      await group.reload();
    }
    return group;
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

  async getAssignmentExports(): Promise<AssignmentExport[]> {
    return AssignmentExport.find({ where: { assignment: this } });
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

  async hasUnsubmittedSubmissionReviewsWhereUserIsReviewer(
    user: User
  ): Promise<boolean> {
    for (const assignmentVersion of this.versions) {
      const submissionQuestionnaire =
        await assignmentVersion.getSubmissionQuestionnaire();
      if (submissionQuestionnaire) {
        if (
          await submissionQuestionnaire.hasUnsubmittedReviewsWhereUserIsReviewer(
            user
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  async hasSubmissionQuestionnaires(): Promise<boolean> {
    for (const assignmentVersion of this.versions) {
      const submissionQuestionnaire =
        await assignmentVersion.getSubmissionQuestionnaire();
      if (!submissionQuestionnaire) {
        return false;
      }
    }

    return true;
  }
}
