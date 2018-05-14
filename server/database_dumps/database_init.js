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

// Change host in case on CI
if (isCI) {
    console.log('The code is running on a CI server');
    connection.host = "postgres";
};

var db = pgp(connection);

console.log("Importing database");
const qf = new QueryFile("./simpleUserDB.sql");

const db_import = async function () {
    try {
        await db.any("DROP SCHEMA IF EXISTS public CASCADE");
        console.log("Dropped schema");
        await db.any("CREATE SCHEMA public");
        console.log("Created schema");
        await db.any(qf);
        console.log("Imported database to: " + connection.database + "@" + connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

db_import();
