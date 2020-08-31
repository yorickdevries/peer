import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsDefined, IsString, IsNotEmpty, IsEnum } from "class-validator";
import Extensions from "../enum/Extensions";

@ChildEntity(QuestionType.UPLOAD)
export default class UploadQuestion extends Question {
  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Extensions)
  // can be in the form: ".pdf,.zip,.doc,.docx"
  // needs later to be revised to a list of strings
  extensions: Extensions;

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire,
    extensions: Extensions
  ) {
    super(text, number, optional, questionnaire);
    this.extensions = extensions;
  }
}
