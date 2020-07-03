import Questionnaire from "./Questionnaire";
import { ChildEntity, OneToOne } from "typeorm";
import Assignment from "./Assignment";
import QuestionnaireType from "../enum/QuestionnaireType";

@ChildEntity(QuestionnaireType.SUBMISSION)
export default class SubmissionQuestionnaire extends Questionnaire {
  @OneToOne(
    (_type) => Assignment,
    (assignment) => assignment.submissionQuestionnaire
  )
  // cannot be named assignment as this clashed with reviewquestionnaire
  assignmentOfSubmissionQuestionnaire?: Assignment;

  constructor() {
    super();
  }

  async getAssignment(): Promise<Assignment> {
    return (
      await SubmissionQuestionnaire.findOneOrFail(this.id, {
        relations: ["assignmentOfSubmissionQuestionnaire"],
      })
    ).assignmentOfSubmissionQuestionnaire!;
  }
}
