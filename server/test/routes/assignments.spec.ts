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
        MockLogin.initialize(router);
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
     * Tests whether assignments are returned
     */
    it("Get assignments/", async () => {
        // log in as henkjan
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(401);
    });

    /**
     * Import group tests
     */
    it("Import groups - good weather", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/example_export.csv");
        // log in as teacheraccount
        MockLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/3/importgroups")
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
        MockLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/3/importgroups")
            .attach("groupFile", fs.readFileSync(file), "text_file.txt");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "File should be a .csv file"}));
    });

    it("Import groups - file larger than 1MB", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/example_export_big.csv");
        // log in as teacheraccount
        MockLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/3/importgroups")
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
        MockLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/3/importgroups");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "No file uploaded"}));
    });

    it("Import groups - good file + no groupcolumn", async () => {
        const file = path.join(__dirname, "../../example_data/csv_test/example_export.csv");
        // log in as teacheraccount
        MockLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).post("/3/importgroups")
            .attach("groupFile", fs.readFileSync(file), "export.csv");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({error: "No groupcolumn defined"}));
    });


    /**
     * Test whether the right reviewId's are returned
     */
    it("GET assignment/id/feedback", async () => {
        // test the router
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/feedback");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{"id": 1}, {"id": 2}]
        ));
    });

    /**
     * Create a new review.
     */
    it("GET /:assignment_id/reviews1", async () => {
        // test the router
        MockLogin.initialize(router, "henkjan");
        const res: any = await chai.request(router).get("/1/reviews");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([{
                "id": 1,
                "user_netid": "henkjan",
                "submission_id": 1,
                "rubric_assignment_id": 1,
                "done": false,
                "creation_date": JSON.parse(res.text)[0].creation_date,
                "grade": -1
            }]
        ));
    });

    /**
     * Get all information about an assignment.
     */
    it("GET /:assignment_id", async () => {
        // test the router
        MockLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "title": "Assignment 1",
                "description": "Example assignment number one",
                "due_date": "2018-05-01T20:30:00.000Z",
                "publish_date": "2018-04-01T20:30:00.000Z",
                "id": 1,
                "course_id": 1,
                "reviews_per_user": 2,
                "filename": "assignment1.pdf",
                "review_due_date": "2018-05-01T20:30:00.000Z",
                "review_publish_date": "2018-04-01T20:30:00.000Z"
            }
        ));
    });

    /**
     * Tests whether an assignment can be uploaded
     */
    it("post assignment/ with file", async () => {
        // log in as bplanje (teacher)
        MockLogin.initialize(router, "bplanje");
        const exampleSubmissionFile = path.join(__dirname, "../../example_data/assignments/assignment1.pdf");
        const res = await chai.request(router).post("/")
            .attach("assignmentFile", fs.readFileSync(exampleSubmissionFile), "assignment1.pdf")
            .field("title", "Example title")
            .field("description", "Example description")
            .field("course_id", 1)
            .field("due_date", "2018-05-01T20:30:00.000Z")
            .field("publish_date", "2018-06-01T20:30:00.000Z")
            .field("reviews_per_user", 2)
            .field("review_due_date", "2018-06-01T20:30:00.000Z")
            .field("review_publish_date", "2018-07-01T20:30:00.000Z");
        // assertions
        const result = JSON.parse(res.text);

        expect(res.status).to.equal(200);
        expect(result.title).to.equal("Example title");
        expect(result.description).to.equal("Example description");
    });

    /**
     * Test whether an assignment is properly updated.
     */
    it("PUT /:assignment_id", async () => {
        const file = path.join(__dirname, "../../example_data/assignments/assignment1.pdf");

        // login as bplanje (teacher)
        MockLogin.initialize(router, "bplanje");

        // Make sure that the assignment is in place.
        const assignment: any = await chai.request(router).post("/")
            .attach("assignmentFile", fs.readFileSync(file), "assignment1.pdf")
            .field("title", "Different title")
            .field("description", "Different description")
            .field("course_id", 1)
            .field("due_date", "2018-05-01T20:30:00.000Z")
            .field("publish_date", "2018-06-01T20:30:00.000Z")
            .field("reviews_per_user", 2)
            .field("review_due_date", "2018-06-01T20:30:00.000Z")
            .field("review_publish_date", "2018-07-01T20:30:00.000Z");

        // Test the updating of the assignment just added.
        const res = await chai.request(router)
            .put("/" + JSON.parse(assignment.text).id)
            .attach("assignmentFile", fs.readFileSync(file), "assignment2.pdf")
            .field("title", "Example title")
            .field("description", "Example description")
            .field("course_id", 1)
            .field("due_date", "2018-05-01T20:30:00.000Z")
            .field("publish_date", "2018-06-01T20:30:00.000Z")
            .field("reviews_per_user", 2)
            .field("review_due_date", "2018-06-01T20:30:00.000Z")
            .field("review_publish_date", "2018-07-01T20:30:00.000Z");

        // assertions
        const result = JSON.parse(res.text);

        expect(res.status).to.equal(200);
        expect(result.title).to.equal("Example title");
        expect(result.description).to.equal("Example description");
    });

    /**
     * Test to get all the submissions of a certain assignment
     */
    it("GET /:assignment_id/submissions", async () => {
        // test the router
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/submissions");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([{
                "id": 1,
                "user_netid": "paulvanderlaan",
                "group_id": 10,
                "assignment_id": 1,
                "file_path": "submission1.pdf",
                "date": "2018-05-01T20:30:01.000Z"
            }, {
                "id": 2,
                "user_netid": "henkjan",
                "group_id": 10,
                "assignment_id": 1,
                "file_path": "submission2.pdf",
                "date": "2018-05-01T20:30:00.000Z"
            }]
        ));
    });

    /**
     * Test to get all submissions.
     */
    it("GET /:assignment_id/allsubmissions", async () => {
        // test the router
        MockLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router).get("/1/allsubmissions");
        expect(res.status).to.equal(401);
    });

    // not in a group
    it("GET /:assignment_id/latestsubmission - user not in group", async () => {
        // test the router
        MockLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router).get("/3/latestsubmission");
        expect(res.text).to.equal(JSON.stringify({error: "User is not in a group in this assignment"}));
    });

    // no submission yet
    it("GET /:assignment_id/latestsubmission - no submission yet", async () => {
        // test the router
        MockLogin.initialize(router, "paulvanderlaan");
        const res = await chai.request(router).get("/2/latestsubmission");
        expect(res.text).to.equal(JSON.stringify({error: "No latest submission could be found"}));
    });

    // latest submission
    it("GET /:assignment_id/latestsubmission", async () => {
        // test the router
        MockLogin.initialize(router, "bplanje");
        const res = await chai.request(router).get("/2/latestsubmission");
        expect(res.text).to.equal(JSON.stringify({
            id: 5,
            user_netid: "yorickdevries",
            group_id: 21,
            assignment_id: 2,
            file_path: "submission2.pdf",
            date: new Date("2018-05-01T22:30:04.000Z"),
            grade: -1
        }));
    });


    /**
     * Test to get all reviews of an assignment.
     */
    it("GET /:id/allreviews", async () => {
        // test the router
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/1/allreviews");
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
        MockLogin.initialize(router, "teacheraccount");
        const res = await chai.request(router).get("/2/distributeReviews");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).length).to.equal(3);
    });

    /**
     * Tests the route for all groups of an assignment
     */
    it("Get groups of an assignment", async () => {
        // log in as henkjan
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/2/groups");
        expect(res.text).to.equal(JSON.stringify([
            {id: 20, group_name: "Group 20"},
            {id: 21, group_name: "Group 21"},
            {id: 22, group_name: "Group 22"}
        ]));
    });
});