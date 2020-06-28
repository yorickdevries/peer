import { PrimaryGeneratedColumn, Entity, TableInheritance } from "typeorm";
import { IsOptional } from "class-validator";
import BaseModel from "./BaseModel";
import Assignment from "./Assignment";

// formely called rubric
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Questionnaire extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  abstract assignment?: Assignment;

  constructor() {
    super();
  }

  abstract getAssignment(): Promise<Assignment>;
}
