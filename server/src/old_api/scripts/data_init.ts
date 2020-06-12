"use strict";
import { QueryFile } from "pg-promise";
import Database from "../database";

import fs from "fs-extra";
import config from "config";
import path from "path";

// import database
const importDatabase = async function () {
    const databaseConfig: any = database_dumps_old;
    
    // Database import files
    const qfSchema = new QueryFile(path.resolve(databaseConfig.schemaQueryFile));
    const qfData = new QueryFile(path.resolve(databaseConfig.fullQueryFile));
    try {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
        console.log("Imported database");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

// copy assignment files
const copyExampleAssignmentData = async function () {
    // Assignment file folders
    const exampleAssignmentFolder = (config.get("exampleData") as any).exampleAssignmentFolder;
    const assignmentFolder = (config.get("assignments") as any).fileFolder;
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
    const exampleSubmissionFolder = (config.get("exampleData") as any).exampleSubmissionFolder;
    const submissionFolder = (config.get("submissions") as any).fileFolder;
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

// copy review files
const copyExampleReviewData = async function () {
    // Submission file folders
    const exampleReviewFolder = (config.get("exampleData") as any).exampleReviewFolder;
    const reviewFolder = (config.get("reviews") as any).fileFolder;
    try {
        // Make folder
        await fs.mkdirs(reviewFolder);
        console.log("Created folder: " + reviewFolder);
        // Copy example data
        await fs.copy(exampleReviewFolder, reviewFolder);
        console.log("Done copying example review data!");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const args = process.argv.slice(2);

// running the initialisation functions
if (process.env.NODE_ENV === "production") {
    throw Error("You cannot run tests in production!");
} else {
    if (!args.includes("--filesonly")) {
        console.log("Importing database");
        importDatabase();
    }
    console.log("Copying example data");
    copyExampleAssignmentData();
    copyExampleSubmissionData();
    copyExampleReviewData();
}