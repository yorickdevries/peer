import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

// file system imports
import fs from "fs-extra";
import path from "path";

const router: any = require("../../src/routes/submissions").default;
// Imitates the login of Okta for testing
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("Submission routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router
        InitLogin.initialize(router);
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);

        // Make file folders
        const exampleSubmissionFolder = path.join(__dirname, "../../example_data/submissions");
        const submissionFolder = path.join(__dirname, "../../src/files/submissions");
        await fs.mkdirs(submissionFolder);
        // Copy example data
        await fs.copy(exampleSubmissionFolder, submissionFolder);
    });

    /**
     * Remove file folders used for testing
     */
    afterEach(async () => {
        const submissionFolder = path.join(__dirname, "../../src/files/submissions");
        // Remove example data
        await fs.remove(submissionFolder);
    });

    /**
     * Tests whether submissions are returned
     */
    it("Get submissions/", async () => {
        const res = await chai.request(router).get("/");
        expect(res.status).to.equal(200);
        const result = JSON.parse(res.text);
        expect(result.length).to.equal(6);
    });

    /**
     * Tests whether a submission can be made
     */
    it("post submissions/ with file", async () => {
        // log in as henkjan
        InitLogin.initialize(router, "henkjan");
        const exampleSubmissionFile = path.join(__dirname, "../../example_data/submissions/submission1.pdf");
        const res = await chai.request(router).post("/")
        .attach("submissionFile", fs.readFileSync(exampleSubmissionFile), "submission1.pdf")
        .field("assignmentId", 1);
        // assertions
        const result = JSON.parse(res.text);
        expect(res.status).to.equal(200);
        expect(result.user_netid).to.equal("henkjan");
        expect(result.assignment_id).to.equal(1);
    });

    /**
     * Tests when no file is attached
     */
    it("post submissions/ without file", async () => {
        // log in as henkjan
        InitLogin.initialize(router, "henkjan");
        const exampleSubmissionFile = path.join(__dirname, "../../example_data/submissions/submission1.pdf");
        const res = await chai.request(router).post("/")
        .field("assignmentId", 1);
        // assertions
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "No file uploaded"}));
    });
});