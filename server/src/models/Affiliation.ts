import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface AffiliationInterface {
  name: string;
}
@Entity()
export default class Affiliation extends NamedModel {
  constructor(init?: AffiliationInterface) {
    if (init !== undefined) {
      super(init.name);
    }
  }
}
