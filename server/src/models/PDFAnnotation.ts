import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  Column,
  TableInheritance,
} from "typeorm";
import { IsString, IsNotEmpty, IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";
import PDFAnnotationMotivation from "../enum/PDFAnnotationMotivation";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "motivation" } })
export default abstract class PDFAnnotation extends BaseModel {
  @PrimaryColumn("varchar")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  id: string;

  // motivation (Type of annotation)
  @Column()
  // will be filled in by typeorm with the PDFAnnotationMotivation
  motivation!: PDFAnnotationMotivation;

  // bodyValue (text which is added in a comment, can be empty)
  @Column("text")
  @IsDefined()
  @IsString()
  bodyValue: string;

  // user (creator)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // file (source)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => File, { nullable: false })
  file?: File;

  // review
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => ReviewOfSubmission, { nullable: false })
  review?: ReviewOfSubmission;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getWebAnnotationVersion(): Promise<any>;

  constructor(
    id: string,
    bodyValue: string,
    user: User,
    file: File,
    review: ReviewOfSubmission
  ) {
    super();
    this.id = id;
    this.bodyValue = bodyValue;
    this.user = user;
    this.file = file;
    this.review = review;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    const user = this.user ? this.user : await this.getUser();
    const file = this.file ? this.file : await this.getFile();
    const review = this.review ? this.review : await this.getReview();
    // check whether submission and file corresponds
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const submission = await review.submission!;
    const submissionFile = submission.file;
    if (file.id !== submissionFile.id) {
      throw new Error("The file is not corresponding to the review");
    }
    // check whether the user is the reviewer
    const reviewUser = review.reviewer;
    if (user.netid !== reviewUser.netid) {
      throw new Error("The user is not corresponding to the review");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getUser(): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await PDFAnnotation.findOneOrFail(this.id, {
        relations: ["user"],
      })
    ).user!;
  }

  async getFile(): Promise<File> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await PDFAnnotation.findOneOrFail(this.id, {
        relations: ["file"],
      })
    ).file!;
  }

  async getReview(): Promise<ReviewOfSubmission> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await PDFAnnotation.findOneOrFail(this.id, {
        relations: ["review"],
      })
    ).review!;
  }
}
