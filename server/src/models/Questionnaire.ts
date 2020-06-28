import { PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from "class-validator";
import BaseModel from "./BaseModel";

// formely called rubric
export default abstract class Questionnaire extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  constructor() {
    super();
  }
}
