import promise from "bluebird";
import isCI from "is-ci";
import pgp from "pg-promise";

class Database {
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
}

export default new Database();