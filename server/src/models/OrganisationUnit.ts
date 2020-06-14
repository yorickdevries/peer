import { Entity, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class OrganisationUnit extends BaseEntity {
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
