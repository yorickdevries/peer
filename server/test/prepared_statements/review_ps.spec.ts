import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import ReviewPS from "../../src/prepared_statements/review_ps";

describe("ReviewPreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Get review by id.
     */
    it("get the review by specific id", async () => {
        const result: any = await ReviewPS.executeGetReview(1);
        expect(result.id).to.equal(1);
    });

    /**
     * Test approve a review prepared statement.
     */
    it("Approve reviews of an assignment", async () => {
        const resultBefore = await ReviewPS.executeGetReview(1);
        // tslint:disable-next-line
        expect(resultBefore.approved).to.equal(null);

        await ReviewPS.executeSetApprovedForReview(false, 1);
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
        expect(await ReviewPS.executeGetAllDoneReviewsByAssignmentId(1)).to.deep.equal([{
            // tslint:disable-next-line
            "approved": null,
            "id": 2,
            "reviewer": "paulvanderlaan",
            "submitter": "paulvanderlaan"
        }]);
    });

    /**
     * Test get reviews for an assignment.
     */
    it("Get all done and pending for approval review ids", async () => {
        expect(await ReviewPS.executeGetAllDoneReviewsByAssignmentIdUnreviewed(1)).to.deep.equal([{
            id: 2
        }])
    });
});