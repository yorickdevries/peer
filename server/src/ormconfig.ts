import config from "config";
import entityList from "./models/entityList";
import path from "path";
import { DataSourceOptions } from "typeorm";

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

const dbConfig: DataSourceOptions = {
  entities: entityList,
  // We are using migrations, synchronize should be set to false.
  // synchronize: false,

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

  // when testing, the database is refreshed
  dropSchema: process.env.NODE_ENV === "test",

  //when testing, automatically run migrations
  migrationsRun: process.env.NODE_ENV === "test",

  type: "mariadb",
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  extra: {
    connectionLimit: process.env.NODE_ENV === "production" ? 50 : 10,
  },
};

export default dbConfig;