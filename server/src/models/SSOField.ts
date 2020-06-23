import { PrimaryColumn } from "typeorm";
import { IsString, IsNotEmpty } from "class-validator";
import { BaseModel } from "./BaseModel";

// This class is extended by Affiliation, Study and OrganisationUnit as they are all classes with just a name
export abstract class SSOField extends BaseModel {
  @PrimaryColumn()
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
