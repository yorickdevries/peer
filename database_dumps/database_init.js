"use strict";

const promise = require("bluebird");
const pgpromise = require("pg-promise");
const QueryFile = require('pg-promise').QueryFile;
const isCI = require('is-ci');

var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = pgpromise(options);
var connection = {
    user: "postgres",
    host: "localhost",
    database: "peer_database",
    password: "password",
    port: 5432
};
if (isCI) {
    console.log('The code is running on a CI server');
    connection.host = "postgres";
};

var db = pgp(connection);

console.log("Importing database");
const qf = new QueryFile("./simpleUserDB.sql");
// run the queryfile to start with a fresh database
db.any(qf)
    .then(function () {
        console.log("Imported database to: " + connection.database + "@" + connection.host);
    })
    .catch(function (err) {
        console.log(err);
    });