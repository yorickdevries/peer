import Questionnaire from "./Questionnaire";
import { Entity, OneToOne } from "typeorm";
import Assignment from "./Assignment";

@Entity()
export default class ReviewQuestionnaire extends Questionnaire {
  @OneToOne(
    (_type) => Assignment,
    (assignment) => assignment.reviewQuestionnaire
  )
  assignment?: Assignment;

  constructor() {
    super();
  }
}
