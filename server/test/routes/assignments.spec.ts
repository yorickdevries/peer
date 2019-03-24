import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/assignments").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

// file system imports
import fs from "fs-extra";
import path from "path";

describe("API Assignment routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router
        MockLogin.initialize();
        await TestData.initializeDatabase();
        await TestData.initializeAssignmentFiles();
    });

    /**
     * Remove file folders used for testing
     */
    afterEach(async () => {
        await TestData.removeAssignmentFiles();
    });

    /**
     * Test of the csv reviews export.
     */
    it("Reviews export valid", async () => {
        // log in as bplanje (teacher)cle
        MockLogin.initialize("bplanje");
        const gradeExport: any = await chai.request(router).get("/1/reviewsExport");

        expect(gradeExport.status).to.equal(200);
        // Make sure it includes at least the henkjan review and paul review.
        expect(gradeExport.text.includes("\"Reviewer netID\",\"Reviewer studentnumber\",\"Reviewer group ID\",\"Reviewer group Name\",\"Submitter netID\",\"Submitter studentnumber\",\"Submitter group ID\",\"Submitter group Name\",\"Done\",\"Approval status\",\"TA netid\",\"What is the best way to insert queries?\",\"Is the right Answer A?\",\"How to insert queries?\",\"How much fun is inserting queries?\""
        )).to.equal(true);
        expect(gradeExport.text.includes("\"henkjan\",,10,\"ED-3\",\"paulvanderlaan\",,10,\"ED-3\"")).to.equal(true);
    });
});