import Questionnaire from "./Questionnaire";
import { Entity, OneToOne } from "typeorm";
import Assignment from "./Assignment";

@Entity()
export default class SubmissionQuestionnaire extends Questionnaire {
  @OneToOne(
    (_type) => Assignment,
    (assignment) => assignment.submissionQuestionnaire
  )
  assignment?: Assignment;

  constructor() {
    super();
  }
}
