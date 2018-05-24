"use strict";
import fs from "fs";
import fx from "mkdir-recursive";
import path from "path";
import pgpromise from "pg-promise";
import Database from "./database";
import ncp from "ncp";
const ncpfunc: any = ncp.ncp;
ncpfunc.limit = 16;

const qf = new pgpromise.QueryFile("../database_dumps/ED3-FullDataBase.sql");

// Make file folders
const exampleSubmissionFolder = path.join(__dirname, "../example_data/submissions");
const submissionFolder = path.join(__dirname, "./files/submissions");
fx.mkdir(submissionFolder, function(err: Error) {
    console.log("Created folder: " + submissionFolder);
    // Copy example data
    ncpfunc(exampleSubmissionFolder, submissionFolder, function (err: Error) {
    if (err) {
        console.log(err);
    } else {
        console.log("Done copying example data!");
    }
   });
});

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