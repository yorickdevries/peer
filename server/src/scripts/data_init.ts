"use strict";
import { QueryFile } from "pg-promise";
import Database from "../database";

import fs from "fs-extra";
import config from "../config";

// import database
const importDatabase = async function () {
    // Database import files
    const qfSchema = new QueryFile(config.database.schemaQueryFile);
    const qfData = new QueryFile(config.database.fullQueryFile);
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
    const exampleAssignmentFolder = config.exampleData.exampleAssignmentFolder;
    const assignmentFolder = config.assignments.fileFolder;
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
    const exampleSubmissionFolder = config.exampleData.exampleSubmissionFolder;
    const submissionFolder = config.submissions.fileFolder;
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