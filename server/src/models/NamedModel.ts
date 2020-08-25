import { PrimaryColumn } from "typeorm";
import { IsString, IsNotEmpty, IsDefined } from "class-validator";
import BaseModel from "./BaseModel";

// This class is extended by other named models like Affiliation, Study and OrganisationUnit
// as they are all classes with just a name as primary key
export default abstract class NamedModel extends BaseModel {
  // length of 191 due to UTF-8MB4 encoding of strings
  // see also: https://github.com/gogs/gogs/issues/4894#issuecomment-348861978
  @PrimaryColumn({ length: 191 })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
