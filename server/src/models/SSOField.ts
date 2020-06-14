import { PrimaryColumn, BaseEntity } from "typeorm";

// This class is extended by Affiliation, Study and OrganisationUnit as they are all classes with just a name
export abstract class SSOField extends BaseEntity {
  @PrimaryColumn()
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  // temporatily added as typescipt doesn't compile when private fields aren't used
  toString(): string {
    return this.name;
  }
}
