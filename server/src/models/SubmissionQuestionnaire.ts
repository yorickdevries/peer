import Questionnaire from "./Questionnaire";
import { ChildEntity, OneToOne } from "typeorm";
import AssignmentVersion from "./AssignmentVersion";
import QuestionnaireType from "../enum/QuestionnaireType";
import Review from "./Review";
import ReviewOfSubmission from "./ReviewOfSubmission";
import Submission from "./Submission";

@ChildEntity(QuestionnaireType.SUBMISSION)
export default class SubmissionQuestionnaire extends Questionnaire {
  @OneToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => AssignmentVersion,
    (assignmentVersion) => assignmentVersion.submissionQuestionnaire
  )
  // cannot be named assignment as this clashed with reviewquestionnaire
  assignmentVersionOfSubmissionQuestionnaire?: AssignmentVersion;

  async getAssignmentVersion(): Promise<AssignmentVersion> {
    return AssignmentVersion.findOneOrFail({
      where: { submissionQuestionnaire: { id: this.id } },
    });
  }

  /**
   * Returns the list of submission reviews associated with the submission
   *
   * @param submission the submission to find reviews for
   * @returns list of submission reviews
   */
  async getReviewsWhereUserIsReviewed(
    submission: Submission
  ): Promise<Review[]> {
    return ReviewOfSubmission.find({
      where: {
        questionnaire: { id: this.id },
        submission: { id: submission.id },
      },
    });
  }
}
