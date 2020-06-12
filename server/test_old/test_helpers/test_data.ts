import { QueryFile } from "pg-promise";
import Database from "../../src/old_api/database";
import config from "config";

// file system imports
import fs from "fs-extra";
import path from "path";

const databaseConfig: any = config.get("old_database");

/**
 * Class responsible for the initialisation of data used for testing
 */
class TestData {
    /**
     * Database schema
     */
    static qfSchema = new QueryFile(path.resolve(databaseConfig.schemaQueryFile));
    /**
     * Example data for in the database
     */
    static qfData = new QueryFile(path.resolve(databaseConfig.testQueryFile));
    /**
     * Example Submission files
     */
    static exampleSubmissionFolder = (config.get("exampleData") as any).exampleSubmissionFolder;
    /**
     * Excample Review files
     */
    static exampleReviewFolder = (config.get("exampleData") as any).exampleReviewFolder;
    /**
     * Example Assignment files
     */
    static exampleAssignmentFolder = (config.get("exampleData") as any).exampleAssignmentFolder;
    /**
     * Submission file folder
     */
    static submissionFolder = (config.get("submissions") as any).fileFolder;
    /**
     * Assignment file folder
     */
    static assignmentFolder = (config.get("assignments") as any).fileFolder;

    /**
     * Review file folder
     */
    static reviewFolder = (config.get("reviews") as any).fileFolder;

    /**
     * initializes the database with testdata
     *
     * @static
     * @memberof TestData
     */
    static async initializeDatabase() {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(this.qfSchema);
        await Database.DatabaseImport(this.qfData);
    }

    /**
     * initializes the file folders with submission testdata
     *
     * @static
     * @memberof TestData
     */
    static async initializeSubmissionFiles() {
        await fs.mkdirs(this.submissionFolder);
        // Copy example data
        await fs.copy(this.exampleSubmissionFolder, this.submissionFolder);
    }

    /**
     * removes the submission testdata
     *
     * @static
     * @memberof TestData
     */
    static async removeSubmissionFiles() {
        await fs.remove(this.submissionFolder);
    }

    /**
     * Initializes the review folder with review test data.
     * @return {Promise<void>}
     */
    static async initializeReviewFiles() {
        await fs.mkdirs(this.reviewFolder);
    }

    /**
     * Removes the review test data.
     * @return {Promise<void>}
     */
    static async removeReviewFiles() {
        await fs.remove(this.reviewFolder);
    }

    /**
     * initializes the file folders with assignment testdata
     *
     * @static
     * @memberof TestData
     */
    static async initializeAssignmentFiles() {
        await fs.mkdirs(this.assignmentFolder);
        await fs.copy(this.exampleAssignmentFolder, this.assignmentFolder);
    }

    /**
     * removes the assignment testdata
     *
     * @static
     * @memberof TestData
     */
    static async removeAssignmentFiles() {
        await fs.remove(this.assignmentFolder);
    }
}

if (process.env.NODE_ENV === "production") {
    throw Error("You cannot run tests in production!");
}

export default TestData;