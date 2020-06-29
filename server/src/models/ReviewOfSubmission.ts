import { ChildEntity, ManyToOne } from "typeorm";
import ReviewType from "../enum/ReviewType";
import Submission from "./Submission";
import User from "./User";
import Questionnaire from "./Questionnaire";
import Review from "./Review";

@ChildEntity(ReviewType.REVIEW_OF_SUBMISSION)
export default class ReviewOfSubmission extends Review {
  @ManyToOne((_type) => Submission, {
    nullable: false,
  })
  submission?: Submission;

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
    submission: Submission
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
    this.submission = submission;
  }
}
