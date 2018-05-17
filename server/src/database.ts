import promise from "bluebird";
import isCI from 'is-ci';
import pgp from "pg-promise";

export default class Database {
  static connection: {
    user: string,
    host: string,
    database: string,
    password: string,
    port: number
  };

  static db: any;

  static initialize() {
    const options = {
      // Initialization Options
      promiseLib: promise
    };
    const pgpObject = pgp(options);

    this.connection = {
      user: "postgres",
      host: "localhost",
      database: "peer_database",
      password: "password",
      port: 5432
    };

    if (isCI) {
      console.log("The code is running on a CI server");
      this.connection.host = "postgres";
    }
    this.db = pgpObject(this.connection);
  }

  // method to import default databse
  static async DatabaseImport(qf: pgp.QueryFile) {
    await this.db.any("DROP SCHEMA IF EXISTS public CASCADE");
    await this.db.any("CREATE SCHEMA public");
    await this.db.any(qf);
  }
}
Database.initialize();