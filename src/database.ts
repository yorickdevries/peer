import promise from "bluebird";
import isCI from "is-ci";

class Database {
  public options;
  public connection;
  public db;

  constructor() {
    this.options = {
      // Initialization Options
      promiseLib: promise
    };
    const pgp = require("pg-promise")(this.options);
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
    this.db = pgp(this.connection);
  }
}

export default new Database();