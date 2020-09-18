import PDFAnnotationMotivation from "../enum/PDFAnnotationMotivation";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import PDFAnnotation from "./PDFAnnotation";
import User from "./User";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";
import CommentingPDFAnnotation from "./CommentingPDFAnnotation";

@ChildEntity(PDFAnnotationMotivation.REPLYING)
export default class ReplyingPDFAnnotation extends PDFAnnotation {
  @RelationId(
    (replyingPDFAnnotation: ReplyingPDFAnnotation) =>
      replyingPDFAnnotation.commentingPDFAnnotation
  )
  commentingPDFAnnotationId!: string;
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => CommentingPDFAnnotation,
    (commentingPDFAnnotation) => commentingPDFAnnotation.replyingPDFAnnotations
  )
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
    const commentingPDFAnnotation = this.commentingPDFAnnotation
      ? this.commentingPDFAnnotation
      : await this.getCommentingPDFAnnotation();
    const file = this.file ? this.file : await this.getFile();
    if (file.id !== commentingPDFAnnotation.fileId) {
      throw new Error("The commentingPDFAnnotation is of another file");
    }
    const review = this.review ? this.review : await this.getReview();
    if (review.id !== commentingPDFAnnotation.reviewId) {
      throw new Error("The commentingPDFAnnotation is of another review");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getCommentingPDFAnnotation(): Promise<CommentingPDFAnnotation> {
    return CommentingPDFAnnotation.findOneOrFail(
      this.commentingPDFAnnotationId
    );
  }

  // https://www.w3.org/TR/annotation-model/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWebAnnotationVersion(): any {
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
        source: this.commentingPDFAnnotationId,
      },
      creator: {
        type: "Person",
        name: this.userNetid,
      },
      created: this.createdAt,
      modified: this.updatedAt,
    };
    return annotation;
  }
}
