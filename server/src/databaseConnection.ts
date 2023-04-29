import "reflect-metadata"; // needed for typeORM to work
import { Connection, createConnection } from "typeorm";
import * as ormconfig from "./ormconfig";

const createDatabaseConnection = async function (): Promise<Connection> {
  return createConnection(ormconfig);
};

export default createDatabaseConnection;
