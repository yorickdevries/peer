import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./models/user";

const createDatabaseConnection = async function () {
  return createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "peer_development",
    entities: [User],
    synchronize: true,
    logging: false,
  });
};

export default createDatabaseConnection;
