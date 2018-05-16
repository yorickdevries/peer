import promise from "bluebird";
import isCI from "is-ci";
import pgp, {errors, default as pgPromise, PreparedStatement} from "pg-promise";

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
  static async DatabaseImport(qf: pgp.QueryFile) {
    await this.db.any("DROP SCHEMA IF EXISTS public CASCADE");
    await this.db.any("CREATE SCHEMA public");
    await this.db.any(qf);
  }


  /**
   * Execute a prepared statements on this database.
   * @param {pgPromise.PreparedStatement} statement - a pg promise prepared statement.
   * @return {pgPromise.queryResult} queryResult - a query result.
   */
  public executeQuery(statement : PreparedStatement): Promise<pgPromise.queryResult> {
      // Execute prepared statement on database and respond a promise.
      return Database.db.any(statement);
  }

  public static async fetchResults(queryResult: Promise<pgPromise.queryResult>) {
    let result;
    const db_result = await queryResult.then(function (data: pgPromise.queryResult) {
        result = data;
    })
        .catch(function (err: Error) {
            result = {
                error: "There was a problem adding the information to the database."
            };
        });

    return result;
  }
}

Database.initialize();
