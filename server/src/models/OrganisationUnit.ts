import { Entity } from "typeorm";
import { NamedModel } from "./NamedModel";

@Entity()
export class OrganisationUnit extends NamedModel {}
