import {
  PrimaryGeneratedColumn,
  Entity,
  TableInheritance,
  Column,
  ManyToOne,
} from "typeorm";
import { IsOptional, IsDefined, IsBoolean, IsDate } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import ReviewType from "../enum/ReviewType";
import Questionnaire from "./Questionnaire";

// formely called rubric
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Review extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  @Column()
  // will be filled in by typeorm with the QuestionnaireType
  type?: ReviewType;

  // Rubric_id int NOT NULL,
  @ManyToOne((_type) => Questionnaire, {
    nullable: false,
  })
  questionnaire: Questionnaire;

  // User_netid varchar(500) NOT NULL,
  @ManyToOne((_type) => User, {
    nullable: false,
  })
  user: User;

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
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsOptional()
  @IsDate()
  startedAt: Date | null;

  // downloaded_at timestamptz,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsOptional()
  @IsDate()
  downloadedAt: Date | null;

  // saved_at timestamptz,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsOptional()
  @IsDate()
  savedAt: Date | null;

  // submitted_at timestamptz,
  @Column({ type: process.env.NODE_ENV === "test" ? undefined : "timestamp" })
  @IsOptional()
  @IsDate()
  submittedAt: Date | null;

  // approved boolean,
  @Column("boolean", { nullable: true })
  @IsOptional()
  @IsBoolean()
  approvalByTA: boolean | null;

  // ta_netid varchar(500),
  @ManyToOne((_type) => User)
  approvingTA: User | null;

  constructor(
    questionnaire: Questionnaire,
    user: User,
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
    this.user = user;
    this.flaggedByReviewer = flaggedByReviewer;
    this.submitted = submitted;
    this.startedAt = startedAt;
    this.downloadedAt = downloadedAt;
    this.savedAt = savedAt;
    this.submittedAt = submittedAt;
    this.approvalByTA = approvalByTA;
    this.approvingTA = approvingTA;
  }
}
