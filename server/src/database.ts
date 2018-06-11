import promise from "bluebird";
import isCI from "is-ci";
import pgp, { errors, default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Database class responsible for the connection to the postgreSQL database.
 * @export
 * @class Database
 */
export default class Database {
  /**
   * Connection object.
   *
   * @static
   * @type {{
   *     user: string,
   *     host: string,
   *     database: string,
   *     password: string,
   *     port: number
   *   }}
   * @memberof Database
   */
  static connection: {
    user: string,
    host: string,
    database: string,
    password: string,
    port: number
  };

  /**
   * Database object which will contain the connection
   *
   * @static
   * @type {*}
   * @memberof Database
   */
  static db: any;
  /**
   * Initialisation method which connects the database settings to this.db .
   *
   * @static
   * @memberof Database
   */
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

    /**
     * Method to import a query file.
     * @param {pgPromise.QueryFile} qf - a pgp queryfile.
     * @return {Promise<void>} - a promise of the result.
     * @constructor - default constructor.
     */
  static async DatabaseImport(qf: pgp.QueryFile) {
    await this.db.any(qf);
  }

    /**
     * Method to drop all tables in default database.
     * @return {Promise<void>} - a promise of the result.
     * @constructor - default constructor.
     */
    static async DatabaseDrop() {
      await this.db.any("DROP SCHEMA IF EXISTS public CASCADE");
      await this.db.any("CREATE SCHEMA public");
    }

    /**
     * Execute a query on the database, using a prepared statement.
     * If the data is fetched without awaiting, a promise is returned. Otherwise the
     * query result.
     * @param {pgPromise.PreparedStatement} statement - a prepared statement to query.
     * @return a database query result or an json error with awaiting, a promise otherwise.
     */
  public static async executeQuery(statement: PreparedStatement) {
      try {
          return await Database.db.any(statement);
      } catch (err) {
        console.log(err);
        return {
            statement: statement,
            error: "There was a problem executing the information to the database."
        };
      }
  }

    /**
     * Execute a query on the database, using a prepared statement.
     * If the data is fetched without awaiting, a promise is returned. Otherwise the
     * query result.
     * @param {pgPromise.PreparedStatement} statement - a prepared statement to query.
     * @return a database query result or an json error with awaiting, a promise otherwise.
     */
    public static async executeQuerySingleResult(statement: PreparedStatement) {
        try {
            return await Database.db.one(statement);
        } catch (err) {
          console.log("Error " + err + "\nStatement: " + statement);
            return {
                statement: statement,
                error: "There was a problem executing the information to the database."
            };
        }
    }
}

Database.initialize();
