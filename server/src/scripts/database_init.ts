"use strict";
import fs from "fs";
import fx from "mkdir-recursive";
import path from "path";
import pgpromise from "pg-promise";
import Database from "../database";
import ncp from "ncp";
const ncpfunc: any = ncp.ncp;
ncpfunc.limit = 16;

const qfSchema = new pgpromise.QueryFile("../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new pgpromise.QueryFile("../../database_dumps/ED3-FullData.sql");

// Make file folders
const exampleSubmissionFolder = path.join(__dirname, "../../example_data/submissions");
const submissionFolder = path.join(__dirname, "../files/submissions");
fx.mkdir(submissionFolder, function(err: Error) {
    console.log("Created folder: " + submissionFolder);
    // Copy example data
    ncpfunc(exampleSubmissionFolder, submissionFolder, function (err: Error) {
    if (err) {
        console.log(err);
    } else {
        console.log("Done copying example submission data!");
    }
   });
});

const exampleAssignmentFolder = path.join(__dirname, "../../example_data/assignments");
const assignmentFolder = path.join(__dirname, "../files/assignments");
fx.mkdir(assignmentFolder, function(err: Error) {
    console.log("Created folder: " + assignmentFolder);
    // Copy example data
    ncpfunc(exampleAssignmentFolder, assignmentFolder, function (err: Error) {
    if (err) {
        console.log(err);
    } else {
        console.log("Done copying example assignment data!");
    }
   });
});

// import database
console.log("Importing database");
const importDatabase = async function () {
    try {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
        console.log("Imported database to: " + Database.connection.database + "@" + Database.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
importDatabase();