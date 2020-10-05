import Questionnaire from "./Questionnaire";
import { ChildEntity, OneToOne } from "typeorm";
import AssignmentVersion from "./AssignmentVersion";
import QuestionnaireType from "../enum/QuestionnaireType";

@ChildEntity(QuestionnaireType.SUBMISSION)
export default class SubmissionQuestionnaire extends Questionnaire {
  @OneToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => AssignmentVersion,
    (assignmentVersion) => assignmentVersion.submissionQuestionnaire
  )
  // cannot be named assignment as this clashed with reviewquestionnaire
  assignmentVersionOfSubmissionQuestionnaire?: AssignmentVersion;

  constructor() {
    super();
  }

  async getAssignmentVersion(): Promise<AssignmentVersion> {
    return AssignmentVersion.findOneOrFail({
      where: { submissionQuestionnaire: this },
    });
  }
}
