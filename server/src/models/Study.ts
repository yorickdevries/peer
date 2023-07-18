import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface StudyInterface {
  name: string;
}

@Entity()
export default class Study extends NamedModel {
  constructor(init?: StudyInterface) {
    if (init !== undefined) {
      super(init.name);
    }
  }
}
