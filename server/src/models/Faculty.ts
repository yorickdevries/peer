import { Entity } from "typeorm";
import { SSOField } from "./NamedModel";

@Entity()
export default class Faculty extends SSOField {}
