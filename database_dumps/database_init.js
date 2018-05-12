const promise = require("bluebird");
const pgpromise = require("pg-promise");
const QueryFile = require('pg-promise').QueryFile;

var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = pgpromise(options);
var connection = {
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "password",
    port: 5432
};
var db = pgp(connection);

console.log("Loading database");
const qf = new QueryFile("./simpleUserDB.sql");
// run the queryfile to start with a fresh database
db.any(qf)
.then(function() {
console.log("Imported database");
})
.catch(function (err) {
console.log(err);
});