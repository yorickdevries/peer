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
        await TestData.initializeReviewFiles();
    });

    /**
     * Remove file folders used for testing
     */
    afterEach(async () => {
        await TestData.removeSubmissionFiles();
        await TestData.removeAssignmentFiles();
        await TestData.removeReviewFiles();
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
     *
     *  paul and yorick log in as student:
     *  - [8] review each other
     *  - [9] submit reviews
     *  - [10] fetch the feedback ids (which id to see your review feedback on)
     *  - [11] fetch the feedback
     */
    it("Full integration test for assignments", async () => {
        // [1]
        // Log in as bplanje (teacher) and create a course.
        MockLogin.initialize("bplanje", undefined, ["employee", "faculty"]);
        const course: any = await chai.request(router)
            .post("/courses/")
            .send({description: "example", name: "test name", enrollable: true});
        const courseId = JSON.parse(course.text).id;
        // Assertions to make sure the course is created.
        expect(course.status).to.equal(200);
        expect(course.text).to.equal(JSON.stringify({
                id: courseId,
                description: "example",
                name: "test name",
                enrollable: true
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
            .field("reviews_per_user", 1)
            .field("publish_date", "2017-05-01T20:30:00.000Z")
            .field("due_date", "2030-06-01T20:30:00.000Z")
            .field("review_publish_date", "2030-07-01T20:30:00.000Z")
            .field("review_due_date", "2030-08-01T20:30:00.000Z")
            .field("one_person_groups", false);
        const assignmentId = JSON.parse(assignment.text).id;
        // Assertions to make sure the assignment is created.
        const assignmentResult = JSON.parse(assignment.text);
        expect(assignment.status).to.equal(200);
        expect(assignmentResult.title).to.equal("Example title");
        expect(assignmentResult.description).to.equal("Example description");
        console.log("Teacher created an assignment");

        // [3]
        // Create rubric
        const res = await chai.request(router).post("/rubric/").send(
            {"assignment_id": assignmentId,
            "rubric_type": "submission"});
        const rubric = JSON.parse(res.text);
        console.log("Teacher created a rubric");

        // Add an option question to the rubric
        const openQuestion = await chai.request(router)
            .post("/rubric/openquestion")
            .send({ question: "opt", rubric_id: rubric.id, question_number: 1 });
        const openQuestionId = JSON.parse(openQuestion.text).id;
        expect(openQuestion.status).to.equal(200);
        expect(openQuestion.text).to.equal(JSON.stringify(
            {
                "id": openQuestionId,
                "question": "opt",
                "rubric_id": rubric.id,
                "question_number": 1,
                "type_question": "open"
            }
        ));
        console.log("Teacher created an open question");

        // [4]
        // Import the groups for the created assignment.
        const file = path.join(__dirname, "../../example_data/csv_test/integration_export.csv");

        const groups = await chai.request(router).post("/assignments/" + assignmentId + "/importgroups")
            .attach("groupFile", fs.readFileSync(file), "export.csv")
            .field("groupColumn", "Education Groups");
        // Assertions to make sure the groups are correctly imported.
        expect(groups.status).to.equal(200);
        expect(groups.text).to.equal(JSON.stringify(
            [{groupId: 25, groupname: "ED 4"}, {groupId: 26, groupname: "ED 3"}]
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
        // set the assignment duedate
        await chai.request(router)
            .put("/assignments/" + assignmentId)
            .field("title", "Example title")
            .field("description", "Example description")
            .field("course_id", courseId)
            .field("reviews_per_user", 1)
            .field("publish_date", "2017-05-01T20:30:00.000Z")
            .field("due_date", "2017-06-01T20:30:00.000Z")
            .field("review_publish_date", "2030-07-01T20:30:00.000Z")
            .field("review_due_date", "2030-08-01T20:30:00.000Z")
            .field("one_person_groups", false);
        console.log("Assignment duedate is set in the past");

        const distribution = await chai.request(router).get("/assignments/" + assignmentId + "/distributeReviews/0");
        // Assertions to make sure the reviews are distributed.
        expect(distribution.status).to.equal(200);
        expect(JSON.parse(distribution.text).length).to.equal(2);
        console.log("Teacher distributed the reviews");

        // set the review publish date
        await chai.request(router)
            .put("/assignments/" + assignmentId)
            .field("title", "Example title")
            .field("description", "Example description")
            .field("course_id", courseId)
            .field("reviews_per_user", 1)
            .field("publish_date", "2017-05-01T20:30:00.000Z")
            .field("due_date", "2017-06-01T20:30:00.000Z")
            .field("review_publish_date", "2017-07-01T20:30:00.000Z")
            .field("review_due_date", "2030-08-01T20:30:00.000Z")
            .field("one_person_groups", false);
        console.log("Review publishdate is set in the past");


        // [8]
        // Review each other.
        // Get the review id that paul should give feedback to.
        MockLogin.initialize("paulvanderlaan");
        const paulFeedback: any = await chai.request(router).get("/assignments/" + assignmentId + "/reviews");
        expect(paulFeedback.status).to.equal(200);

        // Get the review id that yorick should give feedback to.
        MockLogin.initialize("yorickdevries");
        const yorickFeedback: any = await chai.request(router).get("/assignments/" + assignmentId + "/reviews");
        expect(yorickFeedback.status).to.equal(200);

        const yorickFeedbackId = JSON.parse(yorickFeedback.text)[0].id;
        const yorickRubricId = JSON.parse(yorickFeedback.text)[0].rubric_id;
        const yorickFeedbackAnswer = "you did great paul :)";

        const paulFeedbackId = JSON.parse(paulFeedback.text)[0].id;
        const paulRubricId = JSON.parse(paulFeedback.text)[0].rubric_id;
        const paulFeedbackAnswer = "maybe look at it again";

        // Paulvanderlaan reviews yorickdevries.
        MockLogin.initialize("paulvanderlaan");
        const reviewPaul = await chai.request(router)
            .put("/reviews/" + paulFeedbackId)
            .send({
                "review": {
                    "id": paulFeedbackId,
                    "rubric_id": paulRubricId,
                    "file_path": "assignment1.pdf",
                    "done": false
                },
                "form": JSON.stringify([{
                    "question": {
                        "id": openQuestionId,
                        "type_question": "open",
                        "question": "opt",
                        "question_number": 1,
                    }, "answer": {"answer": paulFeedbackAnswer, "openquestion_id": openQuestionId, "review_id": paulFeedbackId}
                }])
            });

        // Assertions to make sure the feedback was correctly inserted.
        expect(reviewPaul.status).to.equal(200);
        const reviewPaulRes = JSON.parse(reviewPaul.text);
        expect(reviewPaulRes.review.id).to.equal(paulFeedbackId);
        expect(reviewPaulRes.form[0].answer.answer).to.equal(paulFeedbackAnswer);

        // Yorickdevries reviews paulvanderlaan.
        MockLogin.initialize("yorickdevries");
        const reviewYorick = await chai.request(router)
            .put("/reviews/" + yorickFeedbackId)
            .send({
                "review": {
                    "id": yorickFeedbackId,
                    "rubric_id": yorickRubricId,
                    "file_path": "assignment1.pdf",
                    "done": false
                },
                "form": JSON.stringify([{
                    "question": {
                        "id": openQuestionId,
                        "type_question": "open",
                        "question": "opt",
                        "question_number": 1,
                    }, "answer": {"answer": yorickFeedbackAnswer, "openquestion_id": openQuestionId, "review_id": yorickFeedbackId}
                }])
            });

        // Assertions to make sure the feedback was correctly inserted.
        expect(reviewYorick.status).to.equal(200);
        const reviewYorickRes = JSON.parse(reviewYorick.text);

        expect(reviewYorickRes.review.id).to.equal(yorickFeedbackId);
        expect(reviewYorickRes.form[0].answer.answer).to.equal(yorickFeedbackAnswer);
        console.log("Student reviewed each other");

        // [9]
        // Submit the reviews
        MockLogin.initialize("yorickdevries");
        const submitReviewYorick = await chai.request(router).get("/reviews/" + yorickFeedbackId + "/submit");
        expect(submitReviewYorick.status).to.equal(200);

        MockLogin.initialize("paulvanderlaan");
        const submitReviewPaul = await chai.request(router).get("/reviews/" + paulFeedbackId + "/submit");
        expect(submitReviewYorick.status).to.equal(200);
        console.log("Student created reviews");

        // [10]
        MockLogin.initialize("bplanje");
        // set the review duedate
        await chai.request(router)
            .put("/assignments/" + assignmentId)
            .field("title", "Example title")
            .field("description", "Example description")
            .field("course_id", courseId)
            .field("reviews_per_user", 1)
            .field("publish_date", "2017-05-01T20:30:00.000Z")
            .field("due_date", "2017-06-01T20:30:00.000Z")
            .field("review_publish_date", "2017-07-01T20:30:00.000Z")
            .field("review_due_date", "2017-08-01T20:30:00.000Z")
            .field("one_person_groups", false);
        console.log("Review duedate is set in the past");
        // Fetch the feedback ids.
        MockLogin.initialize("yorickdevries");
        const feedbackYorickIds = await chai.request(router).get("/assignments/" + assignmentId + "/feedback");
        expect(feedbackYorickIds.status).to.equal(200);
        const feedBackYorickId = JSON.parse(feedbackYorickIds.text)[0].id;

        MockLogin.initialize("paulvanderlaan");
        const feedbackPaulIds = await chai.request(router).get("/assignments/" + assignmentId + "/feedback");
        expect(feedbackPaulIds.status).to.equal(200);
        const feedBackPaulId = JSON.parse(feedbackPaulIds.text)[0].id;
        console.log("Student submitted their reviews");

        // [11]
        // Fetch the feedback (answers).
        MockLogin.initialize("paulvanderlaan");
        const feedbackPaul = await chai.request(router).get("/reviews/" + feedBackPaulId);
        expect(feedbackPaul.status).to.equal(200);
        expect(JSON.parse(feedbackPaul.text).form[0].answer.answer).to.equal(yorickFeedbackAnswer);

        MockLogin.initialize("yorickdevries");
        const feedbackYorick = await chai.request(router).get("/reviews/" + feedBackYorickId);
        expect(feedbackYorick.status).to.equal(200);
        expect(JSON.parse(feedbackYorick.text).form[0].answer.answer).to.equal(paulFeedbackAnswer);
        console.log("Student fetched the reviews");
    });
});
