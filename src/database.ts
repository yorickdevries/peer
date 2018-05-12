import promise from "bluebird";


class Database {
  public options;
  public connection;
  public db;

  constructor () {
    this.options = {
      // Initialization Options
      promiseLib: promise
    };
    const pgp = require("pg-promise")(this.options);
    this.connection = {
      user: "postgres",
      host: "localhost",
      database: "postgres",
      password: "",
      port: 5432
    };
    this.db = pgp(this.connection);
  }


}

export default new Database();