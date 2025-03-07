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
  charset: string;
  connectionUrl?: string;
} = config.get("database");

const baseConfig = {
  entities: entityList,
  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  // migrationsRun: true,
  logging: false,

  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [path.resolve(__dirname, "migration/**/*{.ts,.js}")],

  //Add subscribers
  subscribers: [path.resolve(__dirname, "subscribers/**/*{.ts,.js}")],
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: "src/migration",
    subscribersDir: "src/subscribers",
  },
  // when testing, the database is refreshed
  dropSchema: process.env.NODE_ENV === "test",

  //when testing, automatically run migrations
  migrationsRun: process.env.NODE_ENV === "test",

  // add seeder
  seeds: [path.resolve(__dirname, "seeds/**/*{.ts,.js}")],
  factories: [path.resolve(__dirname, "factories/**/*{.ts,.js}")],
};
// will be assigned in the switch statement
let connectionConfig: ConnectionOptions;

switch (databaseConfig.type) {
  case "mariadb": {
    let mariadbConfig;
    if (databaseConfig.connectionUrl) {
      // Use the URL to set up the connection (like for Heroku)
      mariadbConfig = {
        type: databaseConfig.type,
        url: databaseConfig.connectionUrl,
      };
    } else {
      // use the other parameters
      mariadbConfig = {
        type: databaseConfig.type,
        host: databaseConfig.host,
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        database: databaseConfig.database,
        charset: databaseConfig.charset,
        extra: {
          connectionLimit: process.env.NODE_ENV === "production" ? 50 : 10,
        },
      };
    }
    connectionConfig = { ...baseConfig, ...mariadbConfig };
    break;
  }
  default:
    throw new Error(`Invalid Database type: ${databaseConfig.type}`);
}

export = connectionConfig;
