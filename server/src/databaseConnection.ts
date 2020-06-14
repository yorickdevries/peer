import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import config from "config";
// Database models
import { User } from "./models/User2";

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
    entities: [User],
    synchronize: true,
    logging: false,
  });
};

export default createDatabaseConnection;
