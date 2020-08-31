import PDFAnnotationMotivation from "../enum/PDFAnnotationMotivation";
import { ChildEntity, Column, OneToMany } from "typeorm";
import PDFAnnotation from "./PDFAnnotation";
import { IsDefined } from "class-validator";
import User from "./User";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";
import ReplyingPDFAnnotation from "./ReplyingPDFAnnotation";

@ChildEntity(PDFAnnotationMotivation.COMMENTING)
export default class CommentingPDFAnnotation extends PDFAnnotation {
  // selector (To annotate where the annotation is put in the document)
  // TODO make special class for this?
  @Column({ type: process.env.NODE_ENV === "test" ? "simple-json" : "json" })
  @IsDefined()
  // eslint-disable-next-line @typescript-eslint/ban-types
  selector: object;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => ReplyingPDFAnnotation,
    (replyingPDFAnnotation) => replyingPDFAnnotation.commentingPDFAnnotation
  )
  replyingPDFAnnotations?: ReplyingPDFAnnotation[];

  constructor(
    id: string,
    bodyValue: string,
    user: User,
    file: File,
    review: ReviewOfSubmission,
    // eslint-disable-next-line @typescript-eslint/ban-types
    selector: object
  ) {
    super(id, bodyValue, user, file, review);
    this.selector = selector;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    if (!this.selector) {
      throw new Error("Selector is invalid");
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getReplyingPDFAnnotations(): Promise<ReplyingPDFAnnotation[]> {
    return ReplyingPDFAnnotation.find({
      where: { commentingPDFAnnotation: this },
    });
  }

  // https://www.w3.org/TR/annotation-model/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getWebAnnotationVersion(): Promise<any> {
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
        source: String((await this.getFile()).id),
        selector: this.selector,
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
