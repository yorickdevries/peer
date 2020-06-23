import { Entity } from "typeorm";
import { SSOField } from "./NamedModel";

@Entity()
export class Affiliation extends SSOField {}
