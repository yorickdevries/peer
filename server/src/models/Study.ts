import { Entity } from "typeorm";
import NamedModel from "./NamedModel";

interface StudyInterface {
  name: string;
}

@Entity()
export default class Study extends NamedModel {
  constructor() {
    super();
  }

  init(init: StudyInterface) {
    this.name = init.name;
    return this;
  }
}
