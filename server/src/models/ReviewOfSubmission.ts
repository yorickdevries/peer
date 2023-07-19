import { ChildEntity, ManyToOne } from "typeorm";
import ReviewType from "../enum/ReviewType";
import Submission from "./Submission";
import User from "./User";
import SubmissionQuestionnaire from "./SubmissionQuestionnaire";
import Review from "./Review";
import ReviewOfReview from "./ReviewOfReview";
import PDFAnnotation from "./PDFAnnotation";
import CodeAnnotation from "./CodeAnnotation";
import { dataSource } from "../databaseConnection";

interface ReviewOfSubmissionInterface {
  questionnaire: SubmissionQuestionnaire;
  user: User;
  flaggedByReviewer: boolean;
  submitted: boolean;
  startedAt: Date | null;
  downloadedAt: Date | null;
  submittedAt: Date | null;
  submission: Submission;
}

@ChildEntity(ReviewType.REVIEW_OF_SUBMISSION)
export default class ReviewOfSubmission extends Review {
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => Submission,
    (submission) => submission.reviewOfSubmissions,
    { eager: true }
  )
  // can be null as it is in the same table as reviewOfReview
  submission: Submission;

  constructor() {
    super();
  }

  init(init: ReviewOfSubmissionInterface) {
    this.questionnaire = init.questionnaire;
    this.reviewer = init.user;
    this.flaggedByReviewer = init.flaggedByReviewer;
    this.submitted = init.submitted;
    this.startedAt = init.startedAt;
    this.downloadedAt = init.downloadedAt;
    this.submittedAt = init.submittedAt;
    this.submission = init.submission;
    return this;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    // validation: questionnaire and submission should correspond to same assignment
    const questionnaire = this.questionnaire
      ? this.questionnaire
      : await this.getQuestionnaire();
    const questionnaireAssignmentVersion =
      await questionnaire.getAssignmentVersion();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const submissionAssignmentVersion =
      await this.submission.getAssignmentVersion();
    if (questionnaireAssignmentVersion.id !== submissionAssignmentVersion.id) {
      throw new Error(
        "The questionnaire should correspond to the assignmentversion of the submission"
      );
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  // checks whether the user is reviewed
  async isReviewed(user: User): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const group = await this.submission!.getGroup();
    return await group.hasUser(user);
  }

  async getReviewOfThisReview(): Promise<ReviewOfReview | null> {
    const reviewOfReview = await ReviewOfReview.findOne({
      where: {
        reviewOfSubmission: { id: this.id },
      },
    });
    return reviewOfReview;
  }

  async getPDFAnnotations(): Promise<PDFAnnotation[]> {
    return await dataSource
      .getRepository(PDFAnnotation)
      .find({ where: { review: { id: this.id } } });
  }

  async getCodeAnnotations(): Promise<CodeAnnotation[]> {
    return dataSource
      .getRepository(CodeAnnotation)
      .find({ where: { review: { id: this.id } } });
  }
}
