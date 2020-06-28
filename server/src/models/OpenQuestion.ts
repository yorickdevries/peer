import ReviewQuestionnaire from "./Questionnaire";
import Question from "./Question";
import { Entity } from "typeorm";
//import { ManyToOne } from "typeorm";

@Entity()
export default class OpenQuestion extends Question {
  // Rubric_id int NOT NULL,
  /*
  @ManyToOne(
    (_type) => Questionnaire,
    (questionnaire) => questionnaire.openQuestions,
    {
      nullable: false,
    }
  )
  questionnaire2: Questionnaire;
  */

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: ReviewQuestionnaire
  ) {
    super(text, number, optional, questionnaire);
    //console.log(questionnaire);
  }
}
