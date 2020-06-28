import Questionnaire from "./Questionnaire";
import { Entity } from "typeorm";

@Entity()
export default class ReviewQuestionnaire extends Questionnaire {
  constructor() {
    super();
  }
}
