import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsOptional } from "class-validator";
import BaseModel from "./BaseModel";

@Entity()
// formely called rubric
export default class Questionnaire extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  constructor() {
    super();
  }
}
