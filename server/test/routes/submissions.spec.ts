import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/submissions").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

// file system imports
import fs from "fs-extra";
import path from "path";

describe("Submission routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router
        MockLogin.initialize();
        await TestData.initializeDatabase();
        await TestData.initializeSubmissionFiles();
    });

    /**
     * Remove file folders used for testing
     */
    afterEach(async () => {
        await TestData.removeSubmissionFiles();
    });

    /**
     * Tests whether submissions are returned
     */
    it("Get submissions/", async () => {
        const res = await chai.request(router).get("/");
        expect(res.status).to.equal(200);
        const result = JSON.parse(res.text);
        expect(result.length).to.equal(5);
    });

    /**
     * Tests whether a submission can be made
     */
    it("post submissions/ with file", async () => {
        // log in as henkjan
        MockLogin.initialize("henkjan");
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
        MockLogin.initialize("henkjan");
        const exampleSubmissionFile = path.join(__dirname, "../../example_data/submissions/submission1.pdf");
        const res = await chai.request(router).post("/")
        .field("assignmentId", 1);
        // assertions
        expect(res.status).to.equal(400);
        expect(res.text).to.equal(JSON.stringify({error: "No file uploaded"}));
    });
});