import { Entity } from "typeorm";
import { SSOField } from "./SSOField";

@Entity()
export default class Faculty extends SSOField {}
