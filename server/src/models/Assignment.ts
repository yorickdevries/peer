import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
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
import Course from "./Course";

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

  // course_id int NOT NULL, FK
  @ManyToOne((_type) => Course)
  @JoinTable()
  course: Course;

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
  reviewEvaluationDueDate?: Date | null;

  // description varchar(5000),
  @Column("text", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string | null;

  // filename varchar(500),
  // can be replaced by a file class?
  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filename?: string | null;

  // external_link varchar(1000),
  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsUrl()
  @IsString()
  @IsNotEmpty()
  externalLink?: string | null;

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
    reviewEvaluationDueDate?: Date | null,
    description?: string | null,
    filename?: string | null,
    externalLink?: string | null
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
    this.filename = filename;
    this.externalLink = externalLink;
  }

  //  // CONSTRAINT publish_before_due CHECK (publish_date < due_date),
  // CONSTRAINT due_before_review_publish CHECK (due_date < review_publish_date),
  // CONSTRAINT review_publish_before_review_due CHECK (review_publish_date < review_due_date),
  // CONSTRAINT review_due_before_review_evaluation_due CHECK (review_
  // custom validation needs to be performed
}
