import { Column, Entity } from "typeorm";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import NamedModel from "./NamedModel";

interface FacultyInterface {
  name: string;
  longName: string;
}

@Entity()
export default class Faculty extends NamedModel {
  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  longName: string;

  constructor(init?: FacultyInterface) {
    if (init !== undefined) {
      super(init.name);
      this.longName = init.longName;
    }
  }
}
