import promise from 'bluebird';

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connection = {
    user: 'postgres',
    host: 'localhost',
    database: 'peer_database',
    password: 'password',
    port: 5432,
  };
var db = pgp(connection);

module.exports = db;
