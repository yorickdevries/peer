import { Entity, PrimaryColumn, BaseEntity } from "typeorm";

@Entity()
export class OrganisationUnit extends BaseEntity {
  @PrimaryColumn()
  // Annotated with "!" due to typescripts strictPropertyInitialization
  name!: string;
}
