"use strict";
import fs from "fs";
import path from "path";
import pgpromise from "pg-promise";
import Database from "./database";

const qf = new pgpromise.QueryFile("../database_dumps/ED3-FullDataBase.sql");

// make file folders
const submissionFolder = path.join(__dirname, "./files/submissions");
if (!fs.existsSync(submissionFolder)) {
    fs.mkdirSync(submissionFolder);
    console.log("Created folder: " + submissionFolder);
}

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