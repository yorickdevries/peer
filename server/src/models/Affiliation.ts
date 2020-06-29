import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

@Entity()
export default class Affiliation extends NamedModel {
  constructor(name: string) {
    super(name);
  }
}
