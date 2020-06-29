import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsDefined, IsString, IsNotEmpty } from "class-validator";

@ChildEntity(QuestionType.UPLOAD)
export default class UploadQuestion extends Question {
  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  // can be in the form: ".pdf,.zip,.doc,.docx"
  // needs later to be revides to a list of strings
  extensions: string;

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire,
    extensions: string
  ) {
    super(text, number, optional, questionnaire);
    this.extensions = extensions;
  }
}
