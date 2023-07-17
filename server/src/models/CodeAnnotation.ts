import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { IsDefined, IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import BaseModel from "./BaseModel";
import ReviewOfSubmission from "./ReviewOfSubmission";

interface CodeAnnotationInterface {
  review: ReviewOfSubmission;
  annotationText: string;
  startLineNumber: number;
  endLineNumber: number;
  selectedFile: string;
}

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
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  // TODO: incorporate max length of annotation
  annotationText: string;

  // The starting line of highlighted text
  @Column()
  @IsDefined()
  @IsInt()
  @Min(0)
  startLineNumber: number;

  // The final line of highlighted text
  @Column()
  @IsDefined()
  @IsInt()
  @Min(0)
  endLineNumber: number;

  // The path of the file containing the highlighted text
  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  selectedFile: string;

  constructor(init?: CodeAnnotationInterface) {
    if (init !== undefined) {
      super();
      this.review = init.review;
      this.annotationText = init.annotationText;
      this.startLineNumber = init.startLineNumber;
      this.endLineNumber = init.endLineNumber;
      this.selectedFile = init.selectedFile;
    }
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    if (this.startLineNumber > this.endLineNumber) {
      throw new Error("startLineNumber cannot be bigger than endLineNumber");
    }
    return super.validateOrReject();
  }

  async getReview(): Promise<ReviewOfSubmission> {
    return ReviewOfSubmission.findOneOrFail(this.reviewId);
  }
}
