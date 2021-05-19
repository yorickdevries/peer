import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  RelationId,
} from "typeorm";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";
import BaseModel from "./BaseModel";
//import User from "./User";
//import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";

@Entity()
export default class CodeAnnotation extends BaseModel {
  @PrimaryGeneratedColumn()
  // The id of the code annotation
  id!: number;

  // A single code review may contain multiple code annotations
  @RelationId((codeAnnotation: CodeAnnotation) => codeAnnotation.review)
  reviewId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => ReviewOfSubmission, { nullable: false })
  review?: ReviewOfSubmission;

  // The contents of the code annotation
  @Column()
  @IsString()
  @IsNotEmpty()
  commentText: string;

  // The starting line of highlighted text
  @Column()
  @IsNumber()
  startLineNumber: number;

  // The final line of highlighted text
  @Column()
  @IsNumber()
  endLineNumber: number;

  // The path of the file containing the highlighted text
  @Column()
  @IsString()
  @IsNotEmpty()
  selectedFile: string;

  constructor(
    review: ReviewOfSubmission,
    commentText: string,
    startLineNumber: number,
    endLineNumber: number,
    selectedFile: string
  ) {
    super();
    this.review = review;
    this.commentText = commentText;
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.selectedFile = selectedFile;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    return super.validateOrReject();
  }

  async getReview(): Promise<ReviewOfSubmission> {
    return ReviewOfSubmission.findOneOrFail(this.reviewId);
  }
}
