import { ChildEntity, ManyToOne } from "typeorm";
import ReviewType from "../enum/ReviewType";
import User from "./User";
import Questionnaire from "./Questionnaire";
import Review from "./Review";
import ReviewOfSubmission from "./ReviewOfSubmission";

@ChildEntity(ReviewType.REVIEW_OF_REVIEW)
export default class ReviewOfReview extends Review {
  @ManyToOne((_type) => ReviewOfSubmission)
  // can be null as it is in the same table as reviewOfSubmission
  reviewOfSubmission?: ReviewOfSubmission;

  constructor(
    questionnaire: Questionnaire,
    user: User,
    flaggedByReviewer: boolean,
    submitted: boolean,
    startedAt: Date | null,
    downloadedAt: Date | null,
    savedAt: Date | null,
    submittedAt: Date | null,
    approvalByTA: boolean | null,
    approvingTA: User | null,
    reviewOfSubmission: ReviewOfSubmission
  ) {
    super(
      questionnaire,
      user,
      flaggedByReviewer,
      submitted,
      startedAt,
      downloadedAt,
      savedAt,
      submittedAt,
      approvalByTA,
      approvingTA
    );
    this.reviewOfSubmission = reviewOfSubmission;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    // validation: questionnaire and reviewofsubmission should correspond to same assignment
    const questionnaireAssignment = await this.questionnaire!.getAssignment();
    const reviewOfSubmissionQuestionnaire = await this.reviewOfSubmission!.getQuestionnaire();
    const reviewOfSubmissionQuestionnaireAssignment = await reviewOfSubmissionQuestionnaire.getAssignment();
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
}
