import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  RelationId,
  TableInheritance,
} from "typeorm";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";
import PDFAnnotationMotivation from "../enum/PDFAnnotationMotivation";

// interface PDFAnnotationInterface {
//   id: string;
//   bodyValue: string;
//   user: User;
//   file: File;
//   review: ReviewOfSubmission;
// }

@Entity()
@TableInheritance({ column: { type: "varchar", name: "motivation" } })
export default abstract class PDFAnnotation extends BaseModel {
  // length of max 191 due to UTF-8MB4 encoding of strings
  // see also: https://github.com/gogs/gogs/issues/4894#issuecomment-348861978
  @PrimaryColumn({ length: 63 })
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
  @RelationId((pdfAnnotation: PDFAnnotation) => pdfAnnotation.user)
  userNetid!: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // file (source)
  @RelationId((pdfAnnotation: PDFAnnotation) => pdfAnnotation.file)
  fileId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => File, { nullable: false })
  file?: File;

  // review
  @RelationId((pdfAnnotation: PDFAnnotation) => pdfAnnotation.review)
  reviewId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => ReviewOfSubmission, { nullable: false })
  review?: ReviewOfSubmission;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract getWebAnnotationVersion(): any;

  constructor() {
    super();
  }

  // init(init: PDFAnnotationInterface) {
  //   this.id = init.id;
  //   this.bodyValue = init.bodyValue;
  //   this.user = init.user;
  //   this.file = init.file;
  //   this.review = init.review;
  //   return this;
  // }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    const user = this.user ? this.user : await this.getUser();
    const file = this.file ? this.file : await this.getFile();
    const review = this.review ? this.review : await this.getReview();
    // check whether submission and file corresponds
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const submission = review.submission!;
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
    return User.findOneByOrFail({
      netid: this.userNetid,
    });
  }

  async getFile(): Promise<File> {
    return File.findOneByOrFail({
      id: this.fileId,
    });
  }

  async getReview(): Promise<ReviewOfSubmission> {
    return ReviewOfSubmission.findOneByOrFail({
      id: this.reviewId,
    });
  }
}
