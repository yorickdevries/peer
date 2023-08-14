import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface OrganisationUnitInterface {
  name: string;
}

@Entity()
export default class OrganisationUnit extends NamedModel {
  init(init: OrganisationUnitInterface) {
    this.name = init.name;
    return this;
  }
}
