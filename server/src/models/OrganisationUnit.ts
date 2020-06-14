import { Entity } from "typeorm";
import { SSOField } from "./SSOField";

@Entity()
export class OrganisationUnit extends SSOField {}
