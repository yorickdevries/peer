import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
import "mocha";
import path from "path";
import fs from "fs";

const router: any = require("../../src/routes/assignments").default;
// Imitates the login of Okta for testing
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";

const qfSchema = new QueryFile(path.join(__dirname, "../../database_dumps/ED3-DataBaseSchema.sql"));
const qfData = new QueryFile(path.join(__dirname, "../../database_dumps/ED3-TestData.sql"));

describe("API Assignment routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router without user
        InitLogin.initialize(router);
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });

    /**
     * Tests whether assignments are returned
     */
    it("Get assignments/", async () => {
        // log in as henkjan
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(401);
    });

    /**
     * Import group tests
     */
    it("Import groups - good weather", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/example_export.csv");
        // log in as teacheraccount
        InitLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/1/importgroups")
            .attach("groupFile", fs.readFileSync(file), "export.csv")
            .field("groupColumn", "Education Groups");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{groupId: 1, groupname: "ED 4"}, {groupId: 2, groupname: "ED 3"}]
        ));
    });

    it("Import groups - wrong extension", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/text_file.txt");
        // log in as teacheraccount
        InitLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/1/importgroups")
            .attach("groupFile", fs.readFileSync(file), "text_file.txt");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "File should be a .csv file"}));
    });

    it("Import groups - file larger than 1MB", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/example_export_big.csv");
        // log in as teacheraccount
        InitLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/1/importgroups")
            .attach("groupFile", fs.readFileSync(file), "export.csv");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
            error: {
                code: "LIMIT_FILE_SIZE",
                field: "groupFile",
                storageErrors: []
            }
        }));
    });

    it("Import groups - no file", async () => {
        // log in as teacheraccount
        InitLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/1/importgroups");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "No file uploaded"}));
    });

    it("Import groups - good file + no groupcolumn", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/example_export.csv");
        // log in as teacheraccount
        InitLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/1/importgroups")
            .attach("groupFile", fs.readFileSync(file), "export.csv");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "No groupcolumn defined"}));
    });

    /**
     * Test whether userinfo is returned
     */
    it("GET assignment/id/reviewCount", async () => {
        // test the router
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/reviewCount");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {count: "1"}
        ));
    });

    /**
     * Create a new review.
     */
    it("GET /:assignment_id/requestReview", async () => {
        // test the router
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/requestReview");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                id: 3,
                comment: "",
                user_netid: "henkjan",
                submission_id: 1,
                rubric_assignment_id: 1,
                done: false
            }
        ));
    });

    /**
     * Get all information about an assignment.
     */
    it("GET /:assignment_id", async () => {
        // test the router
        InitLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                title: "Assignment 1",
                description: "Example assignment number one",
                due_date: "2018-05-01T20:30:00.000Z",
                publish_date: "2018-04-01T20:30:00.000Z",
                id: 1,
                course_id: 1,
                filename: "assignment1.pdf"
            }
        ));
    });

    /**
     * Update all information about an assignment.
     */
    it("PUT /:assignment_id", async () => {
        // test the router
        InitLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router)
            .put("/1")
            .send({
                assignment_title: "Example title",
                assignment_description: "Example description",
                course_id: 1,
                assignment_id: 1
            });
        expect(res.status).to.equal(401);
    });

    /**
     * Test to get the submission of someone else.
     */
    it("GET /:assignment_id/submission", async () => {
        // test the router
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/submission");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                id: 2,
                user_netid: "henkjan",
                assignment_id: 1,
                file_path: "submission2.pdf"
            }
        ));
    });

    /**
     * Test to get all submissions.
     */
    it("GET /:assignment_id/allsubmissions", async () => {
        // test the router
        InitLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router).get("/1/allsubmissions");
        expect(res.status).to.equal(401);
    });

    /**
     * Test to get the review the user is currently working on.
     */
    it("GET /:assignment_id/review", async () => {
        // test the router
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/review");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                id: 1,
                comment: "Plagiaat",
                user_netid: "henkjan",
                submission_id: 1,
                rubric_assignment_id: 1,
                done: false
            }
        ));
    });

    /**
     * Test to get all reviews of an assignment.
     */
    it("GET /:id/reviews", async () => {
        // test the router
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/reviews");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{"reviewer": "paulvanderlaan", "submitter": "henkjan"}]
        ));
    });

    /**
     * Check whether reviews can be distributed
     */
    it("Distribute reviews", async () => {
        // log in as teacher
        InitLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).get("/2/distributeReviews");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).length).to.equal(8);
    });
});