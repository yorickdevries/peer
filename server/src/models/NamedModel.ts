import { PrimaryColumn } from "typeorm";
import { IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";

// This class is extended by other named models like Affiliation, Study and OrganisationUnit
// as they are all classes with just a name as primary key
// maybe later a better name can be found
export default abstract class NamedModel extends BaseModel {
  @PrimaryColumn()
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
