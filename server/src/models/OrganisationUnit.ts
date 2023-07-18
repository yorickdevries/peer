import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface OrganisationUnitInterface {
  name: string;
}

@Entity()
export default class OrganisationUnit extends NamedModel {
  constructor(init?: OrganisationUnitInterface) {
    if (init !== undefined) {
      super(init.name);
    }
  }
}
