import { PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from "class-validator";
import BaseModel from "./BaseModel";
import Assignment from "./Assignment";
//import OpenQuestion from "./OpenQuestion";

// formely called rubric
export default abstract class Questionnaire extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  /*
  @OneToMany(
    (_type) => OpenQuestion
    (openQuestion) => openQuestion.questionnaire
  )
  */
  //openQuestions?: OpenQuestion[];

  abstract assignment?: Assignment;

  constructor() {
    super();
  }

  abstract getAssignment(): Promise<Assignment>;
}
