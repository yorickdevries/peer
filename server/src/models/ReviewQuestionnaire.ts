import Questionnaire from "./Questionnaire";
import { ChildEntity, OneToOne } from "typeorm";
import Assignment from "./Assignment";
import QuestionnaireType from "../enum/QuestionnaireType";

@ChildEntity(QuestionnaireType.REVIEW)
export default class ReviewQuestionnaire extends Questionnaire {
  @OneToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => Assignment,
    (assignment) => assignment.reviewQuestionnaire
  )
  // cannot be named assignment as this clashed with submissionquestionnaire
  assignmentOfReviewQuestionnaire?: Assignment;

  constructor() {
    super();
  }

  async getAssignment(): Promise<Assignment> {
    return Assignment.findOneOrFail({ where: { reviewQuestionnaire: this } });
  }
}
