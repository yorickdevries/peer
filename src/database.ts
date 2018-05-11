import promise from "bluebird";

const options = {
  // Initialization Options
  promiseLib: promise
};

const pgp = require("pg-promise")(options);
const connection = {
    user: "postgres",
    host: "localhost",
    database: "peer_database",
    password: "password",
    port: 5432,
  };
const db = pgp(connection);

module.exports = db;
