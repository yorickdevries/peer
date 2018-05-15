"use strict";
import pgpromise from "pg-promise";
import Database from "./database";

const db = new Database();
const qf = new pgpromise.QueryFile("../database_dumps/simpleUserDB.sql");

// import database
console.log("Importing database");
const import_db = async function () {
    try {
        await db.DatabaseImport(qf);
        console.log("Imported database to: " + db.connection.database + "@" + db.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
import_db();