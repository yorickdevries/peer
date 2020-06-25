import { Entity, Column } from "typeorm";
import { IsDefined, IsBoolean } from "class-validator";

import NamedModel from "./NamedModel";

@Entity()
export default class AcademicYear extends NamedModel {
  @Column()
  @IsDefined()
  @IsBoolean()
  active: boolean;

  constructor(name: string, active: boolean) {
    super(name);
    this.active = active;
  }
}
