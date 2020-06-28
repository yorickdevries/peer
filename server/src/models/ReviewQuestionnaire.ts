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

  async getAssignment(): Promise<Assignment> {
    return (
      await ReviewQuestionnaire.findOneOrFail(this.id, {
        relations: ["assignment"],
      })
    ).assignment!;
  }
}
