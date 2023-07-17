import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface AffiliationType {
  name: string;
}
@Entity()
export default class Affiliation extends NamedModel {
  constructor(init?: AffiliationType) {
    if (init !== undefined) {
      super(init.name);
    }
  }
}
