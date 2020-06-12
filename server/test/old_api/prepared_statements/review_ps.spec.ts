import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import ReviewPS from "../../../src/old_api/prepared_statements/review_ps";
import RubricPS from "../../../src/old_api/prepared_statements/rubric_ps";
import AssignmentPS from "../../../src/old_api/prepared_statements/assignment_ps";

describe("ReviewPreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Function that creates a rubric for testing purposes.
     * Required due to foreign key constraints in the database.
     * @return {Promise<pgPromise.queryResult>} a rubric that is also added to the database.
     */
    async function createTestRubric() {
        const assignment: any = await AssignmentPS.executeAddAssignment(
            "TestAssignment 1",
            "Description",
            1, 2,
            "filename",
            new Date("2016-05-01T20:30:00.000Z"),
            new Date("2017-05-01T21:30:00.000Z"),
            new Date("2018-05-01T22:30:00.000Z"),
            new Date("2019-05-01T23:30:00.000Z"),
            false,
            false,
            undefined);
        return await RubricPS.executeCreateRubric(assignment.id, "submission");
    }

    /**
     * Get review by id.
     */
    it("get the review by specific id", async () => {
        const result: any = await ReviewPS.executeGetReview(1);
        expect(result.id).to.equal(1);
    });

    /**
     * Flag a review
     */
    it("flag the review", async () => {
        // Setup
        const result: any = await ReviewPS.executeGetReview(1);
        const initial = result.flagged;
        const updatedFlag = !initial;

        // Act
        await ReviewPS.executeFlagReview(result.id, updatedFlag);

        // Test
        const updatedResult: any = await ReviewPS.executeGetReview(1);
        expect(updatedResult.flagged).to.equal(updatedFlag);
    });

    /**
     * Test approve a review prepared statement.
     */
    it("Approve reviews of an assignment", async () => {
        const resultBefore = await ReviewPS.executeGetReview(1);
        expect(resultBefore.approved).to.equal(null);

        await ReviewPS.executeSetApprovedForReview(false, 1, "bplanje");
        const resultAfter = await ReviewPS.executeGetReview(1);
        expect(resultAfter.approved).to.equal(false);
    });

    /**
     * Submit review by id.
     */
    it("submit review by id", async () => {
        expect((await ReviewPS.executeGetReview(1)).done).to.equal(false);
        const result: any = await ReviewPS.executeSubmitReview(1);
        expect(result[0].done).to.equal(true);
    });

    /**
     * Update mc answer.
     */
    it("update mc answer", async () => {
        expect(await ReviewPS.executeUpdateMpcAnswer(1, 1, 1)).to.deep.equal({
            answer: 1
        });
    });

    /**
     * Update open answer.
     */
    it("update open answer", async () => {
        expect(await ReviewPS.executeUpdateOpenAnswer("new", 1, 1)).to.deep.equal({
            answer: "new"
        });
    });

    /**
     * Update upload answer.
     */
    it("update upload answer", async () => {
        const answer = "serious_answer.pdf";

        const rubric: any = await createTestRubric();
        const question: any = await RubricPS.executeCreateUploadQuestion("something", rubric.id, 0, "pdf", true);
        await ReviewPS.executeUpdateUploadAnswer("kappa.pdf", question.id, 2);
        const updated: any = await ReviewPS.executeUpdateUploadAnswer(answer, question.id, 2);

        expect({
            answer: updated.answer,
        }).to.deep.equal({
            answer
        });
    });

    /**
     * Update range answer.
     */
    it("update range answer", async () => {
        expect(await ReviewPS.executeUpdateRangeAnswer(2, 1, 1)).to.deep.equal({
            answer: 2
        });
    });

    /**
     * Get mc answer.
     */
    it("get mc answer by id", async () => {
        expect(await ReviewPS.executeGetMCAnswer(1, 1)).to.deep.equal({
            "answer": 1,
            "mcquestion_id": 1,
            "review_id": 1
        });
    });

    /**
     * Get open answer.
     */
    it("get open answer by id", async () => {
        expect(await ReviewPS.executeGetOpenAnswer(1, 1)).to.deep.equal({
            answer: "Flesje water is beter dan flesje bier",
            openquestion_id: 1,
            review_id: 1
        });
    });

    /**
     * Get open answer.
     */
    it("get upload answer by id", async () => {
        const answer = "serious_answer.pdf";
        const reviewId = 1;

        const rubric: any = await createTestRubric();
        const question: any = await RubricPS.executeCreateUploadQuestion("something", rubric.id, 0, "pdf", true);

        await ReviewPS.executeUpdateUploadAnswer(answer, question.id, reviewId);
        const fetched: any = await ReviewPS.executeGetUploadAnswer(reviewId, question.id);

        expect({
            answer: fetched.answer,
        }).to.deep.equal({
            answer
        });
    });

    /**
     * Get range answer.
     */
    it("get range answer by id", async () => {
        expect(await ReviewPS.executeGetRangeAnswer(1, 1)).to.deep.equal({
            answer: 4,
            rangequestion_id: 1,
            review_id: 1
        });
    });

    /**
     * Get all review comments.
     */
    it("get all review comments", async () => {
        expect(await ReviewPS.executeGetAllReviewComments(1)).to.deep.equal([{
            "comment": "Keep it up Brian!",
            "id": 1,
            "review_id": 1,
            "netid": "paulvanderlaan"
        }]);
    });

    /**
     * Post review comment.
     */
    it("post review comment", async () => {
        expect(await ReviewPS.executeAddReviewComment(1, "paulvanderlaan", "new")).to.deep.equal({
            "comment": "new",
            "id": 2,
            "review_id": 1,
            "netid": "paulvanderlaan"
        });
    });

    /**
     * Put review comment.
     */
    it("update review comment", async () => {
        expect(await ReviewPS.executeUpdateReviewComment(1, "new")).to.deep.equal({
            "comment": "new",
            "id": 1,
            "review_id": 1,
            "netid": "paulvanderlaan"
        });
    });

    /**
     * Delete review comment.
     */
    it("delete review comment", async () => {
        expect(await ReviewPS.executeDeleteReviewComment(1)).to.deep.equal({
            "comment": "Keep it up Brian!",
            "id": 1,
            "review_id": 1,
            "netid": "paulvanderlaan"
        });
    });


    /**
     * get submission belonging to an review
     */
    it("get submission belonging to an review", async () => {
        expect(await ReviewPS.executeGetSubmissionByReviewId(1)).to.deep.equal({
            date: new Date("2018-05-01T20:30:01.000Z"),
            file_path: "submission1.pdf",
            group_id: 10,
            id: 1,
            user_netid: "paulvanderlaan"
        });
    });

    /**
     * Test get reviews for an assignment.
     */
    it("Reviews of an assignment", async () => {
        expect(await ReviewPS.executeGetAllSubmissionReviewsByAssignmentId(1, true)).to.deep.equal([{
            "approved": null,
            "id": 2,
            "reviewer": "paulvanderlaan",
            "submitter": "paulvanderlaan",
            "ta_netid": null,
            "flagged": false,
            done: true
        }]);
    });

    /**
     * Test get reviews for an assignment.
     */
    it("Get all done and pending for approval review ids", async () => {
        expect(await ReviewPS.executeGetAllDoneSubmissionReviewsByAssignmentIdUnreviewed(1)).to.deep.equal([{
            id: 2
        }]);
    });
});