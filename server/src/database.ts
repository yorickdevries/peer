import promise from "bluebird";
import isCI from "is-ci";
import pgp, { errors, default as pgPromise, PreparedStatement } from "pg-promise";

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

    /**
     * Method to import default database.
     * @param {pgPromise.QueryFile} qf - a pgp queryfile.
     * @return {Promise<void>} - a promise of the result.
     * @constructor - default constructor.
     */
  static async DatabaseImport(qf: pgp.QueryFile) {
    await this.db.any("DROP SCHEMA IF EXISTS public CASCADE");
    await this.db.any("CREATE SCHEMA public");
    await this.db.any(qf);
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
            return {
                statement: statement,
                error: "There was a problem executing the information to the database."
            };
        }
    }
}

Database.initialize();
