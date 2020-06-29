import { ChildEntity, ManyToOne } from "typeorm";
import ReviewType from "../enum/ReviewType";
import User from "./User";
import Questionnaire from "./Questionnaire";
import Review from "./Review";
import ReviewOfSubmission from "./ReviewOfSubmission";

@ChildEntity(ReviewType.REVIEWOFREVIEW)
export default class ReviewOfReview extends Review {
  @ManyToOne((_type) => ReviewOfSubmission, {
    nullable: false,
  })
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
}
