import Questionnaire from "./Questionnaire";
import { ChildEntity, OneToOne } from "typeorm";
import AssignmentVersion from "./AssignmentVersion";
import QuestionnaireType from "../enum/QuestionnaireType";

@ChildEntity(QuestionnaireType.REVIEW)
export default class ReviewQuestionnaire extends Questionnaire {
  @OneToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => AssignmentVersion,
    (assignmentVersion) => assignmentVersion.reviewQuestionnaire
  )
  // cannot be named assignment as this clashed with submissionquestionnaire
  assignmentVersionOfReviewQuestionnaire?: AssignmentVersion;

  constructor() {
    super();
  }

  async getAssignmentVersion(): Promise<AssignmentVersion> {
    return AssignmentVersion.findOneOrFail({
      where: { reviewQuestionnaire: this },
    });
  }
}
