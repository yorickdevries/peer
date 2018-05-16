"use strict";
import pgpromise from "pg-promise";
import Database from "./database";

const qf = new pgpromise.QueryFile("../database_dumps/ED3-FullDataBase.sql");

// import database
console.log("Importing database");
const importDatabase = async function () {
    try {
        await Database.DatabaseImport(qf);
        console.log("Imported database to: " + Database.connection.database + "@" + Database.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
importDatabase();