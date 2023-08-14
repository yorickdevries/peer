import { Column, Entity } from "typeorm";
import { IsBoolean, IsDefined } from "class-validator";
import NamedModel from "./NamedModel";

interface AcademicYearInterface {
  name: string;
  active: boolean;
}

@Entity()
export default class AcademicYear extends NamedModel {
  @Column()
  @IsDefined()
  @IsBoolean()
  active: boolean;

  init(init: AcademicYearInterface) {
    this.active = init.active;
    this.name = init.name;
    return this;
  }
}
