import { ChildEntity, ManyToOne } from "typeorm";
import ReviewType from "../enum/ReviewType";
import Submission from "./Submission";
import User from "./User";
import Questionnaire from "./Questionnaire";
import Review from "./Review";

@ChildEntity(ReviewType.REVIEW_OF_SUBMISSION)
export default class ReviewOfSubmission extends Review {
  @ManyToOne((_type) => Submission)
  // can be null as it is in the same table as reviewOfReview
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

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    // validation: questionnaire and submission should correspond to same assignment
    const questionnaireAssignment = await this.questionnaire!.getAssignment();
    const submissionAssignment = await this.submission!.getAssignment();
    if (questionnaireAssignment.id !== submissionAssignment.id) {
      throw new Error(
        "The questionnaire should correspond to the assignment of the submission"
      );
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }
}
