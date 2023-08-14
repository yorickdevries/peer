import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, Column } from "typeorm";
import QuestionType from "../enum/QuestionType";
import { IsDefined, IsEnum, IsNotEmpty, IsString } from "class-validator";
import Extensions from "../enum/Extensions";

interface UploadQuestionInterface {
  text: string;
  number: number;
  optional: boolean;
  questionnaire: Questionnaire;
  extensions: Extensions;
}

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

  init(init: UploadQuestionInterface) {
    this.text = init.text;
    this.number = init.number;
    this.optional = init.optional;
    this.graded = false;
    this.questionnaire = init.questionnaire;
    this.extensions = init.extensions;
    return this;
  }
}
