import promise from "bluebird";
import isCI from "is-ci";
import pgp from "pg-promise";

export default class Database {
  public connection: {
    user: string,
    host: string,
    database: string,
    password: string,
    port: number
  };
  public db: any;

  constructor() {
    const options = {
      // Initialization Options
      promiseLib: promise
    };
    const pgp_object = pgp(options);

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
    this.db = pgp_object(this.connection);
  }
  // method to import default databse
  async DatabaseImport(qf: pgp.QueryFile) {
    await this.db.any("DROP SCHEMA IF EXISTS public CASCADE");
    console.log("Dropped schema");
    await this.db.any("CREATE SCHEMA public");
    console.log("Created schema");
    await this.db.any(qf);
    console.log("Imported database to: " + this.connection.database + "@" + this.connection.host);
  }
}