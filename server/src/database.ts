import promise from "bluebird";
import isCI from "is-ci";
import pgp, {errors, PreparedStatement} from "pg-promise";

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
    await this.db.any("CREATE SCHEMA public");
    await this.db.any(qf);
  }

  /**
   * Execute a prepared statements on this database.
   * @param {pgPromise.PreparedStatement} statement - a pg promise prepared statement.
   */
  public executeQuery(statement : PreparedStatement) {
      // Execute prepared statement on database and respond with the json resulting object.
      return this.db.any(statement)
          .then((data : any) => {
              return data;
          })
          .catch((err : Error) => {
              return {
                error: err,
                statement: statement,
                msg: "There was a problem adding the information to the database.: "
              };
          });
  }

}