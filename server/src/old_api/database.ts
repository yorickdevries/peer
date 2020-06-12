import promise from "bluebird";
import pgp from "pg-promise";
import config from "config";

/**
 * Database class responsible for the connection to the postgreSQL database.
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

    // Get connection from config file
    const databaseConfig: any = config.get("old_database");
    if (databaseConfig.connectionUrl) {
      this.db = pgpObject(databaseConfig.connectionUrl);
    } else if (databaseConfig.connection) {
      this.db = pgpObject(databaseConfig.connection);
    } else {
      throw Error("No connection parameters available");
    }
  }

    /**
     * Method to import a query file.
     * @param {pgPromise.QueryFile} qf - a pgp queryfile.
     * @return {Promise<void>} - a promise of the result.
     * @constructor - default constructor.
     */
  static async DatabaseImport(qf: pgp.QueryFile) {
    if (process.env.NODE_ENV === "production") {
      throw Error("You are running in production!");
    } else {
      await this.db.any(qf);
    }
  }

    /**
     * Method to drop all tables in default database.
     * @return {Promise<void>} - a promise of the result.
     * @constructor - default constructor.
     */
    static async DatabaseDrop() {
      if (process.env.NODE_ENV === "production") {
        throw Error("You are running in production!");
      } else {
        await this.db.any("DROP SCHEMA IF EXISTS public CASCADE");
        await this.db.any("CREATE SCHEMA public");
      }
    }

    /**
     * Execute a query on the database, using a prepared statement.
     * If the data is fetched without awaiting, a promise is returned. Otherwise the
     * query result.
     * @param {pgPromise.PreparedStatement} statement - a prepared statement to query.
     * @return a database query result or an json error with awaiting, a promise otherwise.
     */
  public static async executeQuery(statement: pgp.PreparedStatement) {
      return Database.db.any(statement);
  }

    /**
     * Execute a query on the database, using a prepared statement.
     * If the data is fetched without awaiting, a promise is returned. Otherwise the
     * query result.
     * @param {pgPromise.PreparedStatement} statement - a prepared statement to query.
     * @return a database query result or an json error with awaiting, a promise otherwise.
     */
    public static async executeQuerySingleResult(statement: pgp.PreparedStatement) {
        return Database.db.one(statement);
    }
}

Database.initialize();
