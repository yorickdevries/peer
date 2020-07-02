import {
  PrimaryGeneratedColumn,
  Entity,
  TableInheritance,
  Column,
  ManyToOne,
  RelationId,
} from "typeorm";
import { IsOptional, IsDefined, IsBoolean, IsDate } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import ReviewType from "../enum/ReviewType";
import Questionnaire from "./Questionnaire";
import UserRole from "../enum/UserRole";

// formely called rubric
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Review extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  @Column()
  // will be filled in by typeorm with the QuestionnaireType
  type!: ReviewType;

  // Rubric_id int NOT NULL,
  @RelationId((review: Review) => review.questionnaire)
  questionnaireId!: number;
  @ManyToOne(
    (_type) => Questionnaire,
    (questionnaire) => questionnaire.reviews,
    { nullable: false }
  )
  questionnaire?: Questionnaire;

  // User_netid varchar(500) NOT NULL,
  @ManyToOne((_type) => User, {
    nullable: false,
    eager: true,
  })
  reviewer?: User;

  // flagged BOOLEAN NOT NULL DEFAULT FALSE,
  @Column()
  @IsDefined()
  @IsBoolean()
  flaggedByReviewer: boolean;

  // done BOOLEAN NOT NULL DEFAULT FALSE,
  @Column()
  @IsDefined()
  @IsBoolean()
  submitted: boolean;

  // started_at timestamptz,
  @Column({
    type: process.env.NODE_ENV === "test" ? "datetime" : "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  startedAt: Date | null;

  // downloaded_at timestamptz,
  @Column({
    type: process.env.NODE_ENV === "test" ? "datetime" : "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  downloadedAt: Date | null;

  // saved_at timestamptz,
  @Column({
    type: process.env.NODE_ENV === "test" ? "datetime" : "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  savedAt: Date | null;

  // submitted_at timestamptz,
  @Column({
    type: process.env.NODE_ENV === "test" ? "datetime" : "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  submittedAt: Date | null;

  // approved boolean,
  @Column("boolean", { nullable: true })
  @IsOptional()
  @IsBoolean()
  approvalByTA: boolean | null;

  // ta_netid varchar(500),
  @ManyToOne((_type) => User, { eager: true })
  approvingTA?: User | null;

  abstract isReviewed(user: User): Promise<boolean>;

  constructor(
    questionnaire: Questionnaire,
    reviewer: User,
    flaggedByReviewer: boolean,
    submitted: boolean,
    startedAt: Date | null,
    downloadedAt: Date | null,
    savedAt: Date | null,
    submittedAt: Date | null,
    approvalByTA: boolean | null,
    approvingTA: User | null
  ) {
    super();
    this.questionnaire = questionnaire;
    this.reviewer = reviewer;
    this.flaggedByReviewer = flaggedByReviewer;
    this.submitted = submitted;
    this.startedAt = startedAt;
    this.downloadedAt = downloadedAt;
    this.savedAt = savedAt;
    this.submittedAt = submittedAt;
    this.approvalByTA = approvalByTA;
    this.approvingTA = approvingTA;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    const assignment = await this.questionnaire!.getAssignment();
    const course = await assignment.getCourse();
    if (!(await course.isEnrolled(this.reviewer!, UserRole.STUDENT))) {
      throw new Error(`${this.reviewer!.netid} should be enrolled in the course`);
    }
    if (this.approvingTA && this.approvalByTA === null) {
      throw new Error("Approval should be set");
    }
    if (!this.approvingTA && typeof this.approvalByTA === "boolean") {
      throw new Error("Approving TA should be set");
    }
    if (this.approvingTA) {
      if (
        !(await course.isEnrolled(
          this.approvingTA,
          UserRole.TEACHING_ASSISTANT
        )) &&
        !(await course.isEnrolled(this.approvingTA, UserRole.TEACHER))
      ) {
        throw new Error(
          `${this.approvingTA.netid} should be enrolled in the course`
        );
      }
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getQuestionnaire(): Promise<Questionnaire> {
    return (
      await Review.findOneOrFail(this.id, {
        relations: ["questionnaire"],
      })
    ).questionnaire!;
  }

  async getReviewer(): Promise<User> {
    return (
      await Review.findOneOrFail(this.id, {
        relations: ["reviewer"],
      })
    ).reviewer!;
  }

  // checks whether the user is teacher
  async isTeacherInCourse(user: User): Promise<boolean> {
    const questionnaire = await this.getQuestionnaire();
    return await questionnaire.isTeacherInCourse(user);
  }

  // checks whether the user is the reviewer
  async isReviewer(user: User): Promise<boolean> {
    const reviewer = await this.getReviewer();
    return reviewer.netid === user.netid;
  }
}
