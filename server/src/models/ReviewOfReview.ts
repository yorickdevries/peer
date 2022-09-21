import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import ReviewType from "../enum/ReviewType";
import User from "./User";
import ReviewQuestionnaire from "./ReviewQuestionnaire";
import Review from "./Review";
import ReviewOfSubmission from "./ReviewOfSubmission";

@ChildEntity(ReviewType.REVIEW_OF_REVIEW)
export default class ReviewOfReview extends Review {
  @RelationId(
    (reviewOfReview: ReviewOfReview) => reviewOfReview.reviewOfSubmission
  )
  reviewOfSubmissionId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => ReviewOfSubmission, { eager: true })
  // can be null as it is in the same table as reviewOfSubmission
  reviewOfSubmission?: ReviewOfSubmission;

  constructor(
    questionnaire: ReviewQuestionnaire,
    user: User,
    flaggedByReviewer: boolean,
    submitted: boolean,
    startedAt: Date | null,
    downloadedAt: Date | null,
    submittedAt: Date | null,
    reviewOfSubmission: ReviewOfSubmission
  ) {
    super(
      questionnaire,
      user,
      flaggedByReviewer,
      submitted,
      startedAt,
      downloadedAt,
      submittedAt
    );
    this.reviewOfSubmission = reviewOfSubmission;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    // validation: questionnaire and reviewofsubmission should correspond to same assignment
    const questionnaire = this.questionnaire
      ? this.questionnaire
      : await this.getQuestionnaire();
    const questionnaireAssignmentVersion = await questionnaire.getAssignmentVersion();
    const questionnaireAssignment = await questionnaireAssignmentVersion.getAssignment();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const reviewOfSubmissionQuestionnaire = await this.reviewOfSubmission!.getQuestionnaire();
    const reviewOfSubmissionQuestionnaireAssignmentVersion = await reviewOfSubmissionQuestionnaire.getAssignmentVersion();
    const reviewOfSubmissionQuestionnaireAssignment = await reviewOfSubmissionQuestionnaireAssignmentVersion.getAssignment();
    if (
      questionnaireAssignment.id !==
      reviewOfSubmissionQuestionnaireAssignment.id
    ) {
      throw new Error(
        "The questionnaire should correspond to the assignment of the review"
      );
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getReviewOfSubmission(): Promise<ReviewOfSubmission> {
    return ReviewOfSubmission.findOneOrFail(this.reviewOfSubmissionId);
  }

  // checks whether the user is reviewed
  async isReviewed(user: User): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.reviewOfSubmission!.reviewer.netid === user.netid;
  }
}
