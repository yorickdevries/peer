import Questionnaire from "./Questionnaire";
import { Entity } from "typeorm";

@Entity()
export default class SubmissionQuestionnaire extends Questionnaire {
  constructor() {
    super();
  }
}
