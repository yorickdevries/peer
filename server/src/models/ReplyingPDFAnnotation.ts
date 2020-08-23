import PDFAnnotationMotivation from "../enum/PDFAnnotationMotivation";
import { ChildEntity, ManyToOne } from "typeorm";
import PDFAnnotation from "./PDFAnnotation";
import User from "./User";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";
import CommentingPDFAnnotation from "./CommentingPDFAnnotation";

@ChildEntity(PDFAnnotationMotivation.REPLYING)
export default class ReplyingPDFAnnotation extends PDFAnnotation {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => CommentingPDFAnnotation, { eager: true })
  // can be null as it is in the same table as commentingPDFAnnotation
  commentingPDFAnnotation?: CommentingPDFAnnotation;

  constructor(
    id: string,
    bodyValue: string,
    user: User,
    file: File,
    review: ReviewOfSubmission,
    commentingPDFAnnotation: CommentingPDFAnnotation
  ) {
    super(id, bodyValue, user, file, review);
    this.commentingPDFAnnotation = commentingPDFAnnotation;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    const file = this.file ? this.file : await this.getFile();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const commentingPDFAnnotationFile = await this.commentingPDFAnnotation!.getFile();
    if (file.id !== commentingPDFAnnotationFile.id) {
      throw new Error("The commentingPDFAnnotation is of another file");
    }
    const review = this.review ? this.review : await this.getReview();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const commentingPDFAnnotationReview = await this.commentingPDFAnnotation!.getReview();
    if (review.id !== commentingPDFAnnotationReview.id) {
      throw new Error("The commentingPDFAnnotation is of another review");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  // https://www.w3.org/TR/annotation-model/
  // eslint-disable-next-line @typescript-eslint/ban-types
  async getWebAnnotationVersion(): Promise<object> {
    const annotation = {
      "@context": [
        "https://www.w3.org/ns/anno.jsonld",
        "https://comments.acrobat.com/ns/anno.jsonld",
      ],
      type: "Annotation",
      id: this.id,
      bodyValue: this.bodyValue,
      motivation: this.motivation,
      target: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        source: this.commentingPDFAnnotation!.id,
      },
      creator: {
        type: "Person",
        name: (await this.getUser()).netid,
      },
      created: this.createdAt,
      modified: this.updatedAt,
    };
    return annotation;
  }
}
