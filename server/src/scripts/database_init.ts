"use strict";
import { QueryFile } from "pg-promise";
import Database from "../database";

import fs from "fs-extra";
import path from "path";

// import database
const importDatabase = async function () {
    // Database import files
    const qfSchema = new QueryFile("../../database_dumps/ED3-DataBaseSchema.sql");
    const qfData = new QueryFile("../../database_dumps/ED3-FullData.sql");
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

// copy assignment files
const copyExampleAssignmentData = async function () {
    // Assignment file folders
    const exampleAssignmentFolder = path.join(__dirname, "../../example_data/assignments");
    const assignmentFolder = path.join(__dirname, "../files/assignments");
    try {
        // Make folder
        await fs.mkdirs(assignmentFolder);
        console.log("Created folder: " + assignmentFolder);
        // Copy example data
        await fs.copy(exampleAssignmentFolder, assignmentFolder);
        console.log("Done copying example assignment data!");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

// copy submission files
const copyExampleSubmissionData = async function () {
    // Submission file folders
    const exampleSubmissionFolder = path.join(__dirname, "../../example_data/submissions");
    const submissionFolder = path.join(__dirname, "../files/submissions");
    try {
        // Make folder
        await fs.mkdirs(submissionFolder);
        console.log("Created folder: " + submissionFolder);
        // Copy example data
        await fs.copy(exampleSubmissionFolder, submissionFolder);
        console.log("Done copying example submission data!");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

// running the initialisation functions
console.log("Importing database");
importDatabase();
console.log("Copying example data");
copyExampleAssignmentData();
copyExampleSubmissionData();