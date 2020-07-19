import { ConnectionOptions } from "typeorm";
import config from "config";
import entityList from "./models/entityList";
import path from "path";

// Database config for TypeORM

const databaseConfig: {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  connectionUrl?: string;
} = config.get("database");

const baseConfig = {
  entities: entityList,
  // We are using migrations, synchronize should be set to false in production.
  synchronize: process.env.NODE_ENV === "production" ? false : true,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  // migrationsRun: true,
  logging: false,

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [path.resolve(__dirname, "migration/**/*{.ts,.js}")],
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: "src/migration",
  },
};
// will be assigned in the switch statement
let connectionConfig: ConnectionOptions;

switch (databaseConfig.type) {
  case "mysql": {
    let mysqlConfig;
    if (databaseConfig.connectionUrl) {
      // Use the URL to set up the connection (like for Heroku)
      mysqlConfig = {
        type: databaseConfig.type,
        url: databaseConfig.connectionUrl,
      };
    } else {
      // use the other parameters
      mysqlConfig = {
        type: databaseConfig.type,
        host: databaseConfig.host,
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
      };
    }
    connectionConfig = { ...baseConfig, ...mysqlConfig };
    break;
  }
  // in memory database for testing
  case "sqlite": {
    const sqliteConfig = {
      type: databaseConfig.type,
      database: ":memory:",
      dropSchema: true,
    };
    connectionConfig = { ...baseConfig, ...sqliteConfig };
    break;
  }
  default:
    throw new Error(`Invalid Database type: ${databaseConfig.type}`);
}

export = connectionConfig;
