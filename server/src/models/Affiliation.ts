import { Entity } from "typeorm";
import { SSOField } from "./SSOField";

@Entity()
export class Affiliation extends SSOField {}
