import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface AffiliationInterface {
  name: string;
}
@Entity()
export default class Affiliation extends NamedModel {
  constructor() {
    super();
  }
  init(init: AffiliationInterface) {
    this.name = init.name;
    return this;
  }
}
