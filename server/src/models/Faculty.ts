import { Column, Entity } from "typeorm";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import NamedModel from "./NamedModel";

@Entity()
export default class Faculty extends NamedModel {
  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  longName: string;

  constructor(name: string, longName: string) {
    super(name);
    this.longName = longName;
  }
}
