import promise from "bluebird";
import isCI from "is-ci";
import pgp, {PreparedStatement} from "pg-promise";

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

    /**
     * Execute a prepared statements on this database.
     * @param {pgPromise.PreparedStatement} statement - a pg promise prepared statement.
     */
  public executeQuery(statement : PreparedStatement) {
      // Execute prepared statement on database and respond with the json resulting object.
      this.db.none(statement)
          .then(() => {
              // user added;
          })
          .catch((error : any) => {
              return console.log("[src:database.ts] Error: " + error);
          });
  }

}