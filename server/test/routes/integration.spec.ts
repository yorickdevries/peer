import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/api").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

// file system imports
import fs from "fs-extra";
import path from "path";

describe("API integration test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router
        MockLogin.initialize();
        await TestData.initializeDatabase();
        await TestData.initializeSubmissionFiles();
        await TestData.initializeAssignmentFiles();
    });

    /**
     * Remove file folders used for testing
     */
    afterEach(async () => {
        await TestData.removeSubmissionFiles();
        await TestData.removeAssignmentFiles();
    });

    /**
     * Test if reviews can only be fetched after the due date.
     * Integration test. User story:
     *
     * bplanje logs in as teacher:
     *  - [1] creates a course
     *  - [2] creates an assignment
     *  - [3] adds an open question to the rubric
     *  - [4] imports the groups
     *
     *  paulvanderlaan logs in as student:
     *  - [5] submit a submission
     *
     *  yorickdevries logs in as student:
     *  - [6] submit a submission
     *
     *  bplanje logs in as teacher:
     *  - [7] distribute the reviews
     */
    it("Full integration test for assignments", async () => {
        // [1]
        // Log in as bplanje (teacher) and create a course.
        MockLogin.initialize("bplanje");
        const course: any = await chai.request(router)
            .post("/courses/")
            .send({description: "example", name: "test name"});
        const courseId = JSON.parse(course.text).id;
        // Assertions to make sure the course is created.
        expect(course.status).to.equal(200);
        expect(course.text).to.equal(JSON.stringify({
                id: courseId,
                description: "example",
                name: "test name"
            }
        ));
        console.log("Teacher created a course");

        // [2]
        // Create an assignment.
        const exampleSubmissionFile1 = path.join(__dirname, "../../example_data/assignments/assignment1.pdf");
        const assignment: any = await chai.request(router).post("/assignments/")
            .attach("assignmentFile", fs.readFileSync(exampleSubmissionFile1), "assignment1.pdf")
            .field("title", "Example title")
            .field("description", "Example description")
            .field("course_id", courseId)
            .field("due_date", "2018-05-01T20:30:00.000Z")
            .field("publish_date", "2018-06-01T20:30:00.000Z")
            .field("reviews_per_user", 1)
            .field("review_due_date", "2018-06-01T20:30:00.000Z")
            .field("review_publish_date", "2018-07-01T20:30:00.000Z");
        const assignmentId = JSON.parse(assignment.text).id;
        // Assertions to make sure the assignment is created.
        const assignmentResult = JSON.parse(assignment.text);
        expect(assignment.status).to.equal(200);
        expect(assignmentResult.title).to.equal("Example title");
        expect(assignmentResult.description).to.equal("Example description");
        console.log("Teacher created an assignment");

        // [3]
        // Add an option question to the rubric
        const openQuestion = await chai.request(router)
            .post("/rubric/openquestion")
            .send({ question: "opt", rubric_assignment_id: assignmentId, question_number: 1 });
        expect(openQuestion.status).to.equal(200);
        expect(openQuestion.text).to.equal(JSON.stringify(
            {
                "id": 2,
                "question": "opt",
                "rubric_assignment_id": assignmentId,
                "question_number": 1,
                "type_question": "open"
            }
        ));
        console.log("Teacher created an open question");

        // [4]
        // Import the groups for the created assignment.
        const file = path.join(__dirname, "../../example_data/csv_test/example_export.csv");

        const groups = await chai.request(router).post("/assignments/" + assignmentId + "/importgroups")
            .attach("groupFile", fs.readFileSync(file), "export.csv")
            .field("groupColumn", "Education Groups");
        // Assertions to make sure the groups are correctly imported.
        expect(groups.status).to.equal(200);
        expect(groups.text).to.equal(JSON.stringify(
            [{groupId: 1, groupname: "ED 4"}, {groupId: 2, groupname: "ED 3"}]
        ));
        console.log("Teacher imported the groups");

        // [5]
        // Login as paulvanderlaan and submit a submission.
        MockLogin.initialize("paulvanderlaan");
        const exampleSubmissionFile2 = path.join(__dirname, "../../example_data/submissions/submission1.pdf");
        const submissionPaul = await chai.request(router).post("/submissions/")
            .attach("submissionFile", fs.readFileSync(exampleSubmissionFile2), "submission2.pdf")
            .field("assignmentId", assignmentId);
        // Assertions to make sure Paul submitted.
        const submissionPaulResult = JSON.parse(submissionPaul.text);
        console.log(submissionPaulResult);
        expect(submissionPaul.status).to.equal(200);
        expect(submissionPaulResult.user_netid).to.equal("paulvanderlaan");
        expect(submissionPaulResult.assignment_id).to.equal(assignmentId);
        console.log("Paul submitted a submission");

        // [6]
        // Login as yorickdevries and submit a submission
        MockLogin.initialize("yorickdevries");
        const submissionYorick = await chai.request(router).post("/submissions/")
            .attach("submissionFile", fs.readFileSync(exampleSubmissionFile2), "submission2.pdf")
            .field("assignmentId", assignmentId);
        // Assertions to make sure Yorick submitted.
        const submissionYorickResult = JSON.parse(submissionYorick.text);
        expect(submissionYorick.status).to.equal(200);
        expect(submissionYorickResult.user_netid).to.equal("yorickdevries");
        expect(submissionYorickResult.assignment_id).to.equal(assignmentId);
        console.log("Yorick submitted a submission");

        // [7]
        // Distribute the reviews
        MockLogin.initialize("bplanje");
        const distribution = await chai.request(router).get("/assignments/" + assignmentId + "/distributeReviews");
        // Assertions to make sure the reviews are distributed.
        expect(distribution.status).to.equal(200);
        expect(JSON.parse(distribution.text).length).to.equal(5);
        console.log("Teacher distributed the reviews");

        // [8]
        // Paulvanderlaan reviews yorickdevries.
        const res = await chai.request(router)
            .put("/")
            .send({
                "review": {
                    "id": 1,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
                    "done": false
                },
                "form": [{
                    "question": {
                        "id": 1,
                        "type_question": "mc",
                        "question": "What is the best way to insert queries?",
                        "question_number": 3,
                        "option": [{"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}, {
                            "id": 2,
                            "option": "By using command line",
                            "mcquestion_id": 1
                        }, {"id": 3, "option": "By asking Brian", "mcquestion_id": 1}]
                    }, "answer": {"answer": 1, "mcquestion_id": 1, "review_id": 1}
                }]
            });

        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
                "review": {
                    "id": 1,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
                    "done": false
                },
                "form": [{
                    "question": {
                        "id": 1,
                        "type_question": "mc",
                        "question": "What is the best way to insert queries?",
                        "question_number": 3,
                        "option": [{"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}, {
                            "id": 2,
                            "option": "By using command line",
                            "mcquestion_id": 1
                        }, {"id": 3, "option": "By asking Brian", "mcquestion_id": 1}]
                    }, "answer": {"answer": 1}
                }]
            }
        ));

        // // [7]
        // MockLogin.initialize(router, "yorickdevries");
        // const feedbackIds = await chai.request(router).get("/1/feedback");
        //
        //
        // expect(feedbackIds.text).to.equal(JSON.stringify([
        //     {id: 20, group_name: "Group 20"},
        //     {id: 21, group_name: "Group 21"},
        //     {id: 22, group_name: "Group 22"}
        // ]));
    });
});
