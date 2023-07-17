import { Column, Entity } from "typeorm";
import { IsBoolean, IsDefined } from "class-validator";
import NamedModel from "./NamedModel";

interface AcademicYearType {
  name: string;
  active: boolean;
}

@Entity()
export default class AcademicYear extends NamedModel {
  @Column()
  @IsDefined()
  @IsBoolean()
  active: boolean;

  constructor(init?: AcademicYearType) {
    if (init !== undefined) {
      super(init.name);
      this.active = init.active;
    }
  }
}
