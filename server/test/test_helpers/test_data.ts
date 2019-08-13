import { QueryFile } from "pg-promise";
import Database from "../../src/database";

// file system imports
import fs from "fs-extra";
import path from "path";

/**
 * Class responsible for the initialisation of data used for testing
 */
export default class TestData {
    /**
     * Database schema
     */
    static qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
    /**
     * Example data for in the database
     */
    static qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");
    /**
     * Example Submission files
     */
    static exampleSubmissionFolder = path.join(__dirname, "../../example_data/submissions");
    /**
     * Excample Review files
     */
    static exampleReviewFolder = path.join(__dirname, "../../example_data/reviews");
    /**
     * Submission file folder
     */
    static submissionFolder = path.join(__dirname, "../../src/files/submissions");
    /**
     * Example Assignment files
     */
    static exampleAssignmentFolder = path.join(__dirname, "../../example_data/assignments");
    /**
     * Assignment file folder
     */
    static assignmentFolder = path.join(__dirname, "../../src/files/assignments");

    /**
     * Review file folder
     */
    static reviewFolder = path.join(__dirname, "../../src/files/reviews");

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
        // Copy example data
        await fs.copy(this.exampleReviewFolder, this.reviewFolder);
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
