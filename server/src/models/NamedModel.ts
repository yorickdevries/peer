import { PrimaryGeneratedColumn, Column } from "typeorm";
import { IsString, IsNotEmpty, IsDefined } from "class-validator";
import BaseModel from "./BaseModel";

// This class is extended by other named models like Affiliation, Study and OrganisationUnit
// as they are all classes with just a name as primary key
export default abstract class NamedModel extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
