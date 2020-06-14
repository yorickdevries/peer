import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import config from "config";
// Database models
import { User } from "./models/User";
import { Affiliation } from "./models/Affiliation";
import { Study } from "./models/Study";
import { OrganisationUnit } from "./models/OrganisationUnit";

const databaseConfig: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} = config.get("database");

const createDatabaseConnection = async function (): Promise<Connection> {
  return createConnection({
    type: "mysql",
    host: databaseConfig.host,
    port: databaseConfig.port,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    entities: [User, Affiliation, Study, OrganisationUnit],
    synchronize: true,
    logging: false,
  });
};

export default createDatabaseConnection;
