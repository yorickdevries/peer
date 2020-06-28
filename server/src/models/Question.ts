import { PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import {
  IsOptional,
  IsDefined,
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsBoolean,
} from "class-validator";
import BaseModel from "./BaseModel";
import ReviewQuestionnaire from "./ReviewQuestionnaire";

export default abstract class Question extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  // question varchar(5000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  // question_number int NOT NULL,
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  number: number;

  // optional boolean NOT NULL,
  @Column()
  @IsDefined()
  @IsBoolean()
  optional: boolean;

  // Rubric_id int NOT NULL,
  //abstract questionnaire?: Questionnaire;
  @ManyToOne(
    (_type) => ReviewQuestionnaire,
    //(questionnaire) => questionnaire.openQuestions,
    {
      nullable: false,
    }
  )
  questionnaire?: ReviewQuestionnaire;

  constructor(text: string, number: number, optional: boolean, questionnaire: ReviewQuestionnaire) {
    super();
    this.text = text;
    this.number = number;
    this.optional = optional;
    this.questionnaire = questionnaire;
  }
}
