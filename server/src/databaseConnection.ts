import "reflect-metadata"; // needed for typeORM to work
import { DataSource } from "typeorm";
import ormconfig from "./ormconfig";

export const dataSource = new DataSource(ormconfig);
