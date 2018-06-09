import SubmissionPS from "../../src/prepared_statements/submissions_ps";
import { expect } from "chai";
import "mocha";
import TestDatabase from "../test_helpers/test_database";
import ReviewPS from "../../src/prepared_statements/review_ps";

describe("SubmissionPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestDatabase.initialize();
    });

    /**
     * Test get submission by id prepared statement.
     */
    it("get submission by id", async () => {
        expect(await SubmissionPS.executeGetSubmissionById(1)).to.deep.equal({
            id: 1,
            user_netid: "paulvanderlaan",
            group_id: 10,
            assignment_id: 1,
            file_path: "submission1.pdf",
            date: new Date("2018-05-01T20:30:01.000Z"),
            grade: -1
        });
    });

    /**
     * Test creation of a submission prepared statement.
     */
    it("create submission", async () => {
        expect(await SubmissionPS.executeCreateSubmission("paulvanderlaan", 10, 1, "filepathhere", new Date("2018-05-01T20:30:00Z"))).to.deep.equal({
            id: 6,
            group_id: 10,
            user_netid: "paulvanderlaan",
            assignment_id: 1,
            file_path: "filepathhere",
            date: new Date("2018-05-01T20:30:00Z"),
            grade: -1
        });
    });

    /**
     * Test delete submission by id prepared statement.
     */
    it("delete submission by id", async () => {
        expect(await SubmissionPS.executeDeleteSubmissionById(2)).to.deep.equal({
            id: 2,
            user_netid: "henkjan",
            group_id: 10,
            assignment_id: 1,
            file_path: "submission2.pdf",
            date: new Date("2018-05-01T20:30:00Z"),
            grade: -1
        });
    });

    /**
     * Get all review comments.
     */
    it("get all submission comments", async () => {
        expect(await SubmissionPS.executeGetAllSubmissionComments(1)).to.deep.equal([{
            "comment": "Keep it up Brian!",
            "id": 1,
            "submission_id": 1,
            "netid": "paulvanderlaan"
        }]);
    });

    /**
     * Post review comment.
     */
    it("post submission comment", async () => {
        expect(await SubmissionPS.executeAddSubmissionComment(1, "paulvanderlaan", "new")).to.deep.equal({
            "comment": "new",
            "id": 2,
            "submission_id": 1,
            "netid": "paulvanderlaan"
        });
    });

    /**
     * Put review comment.
     */
    it("update submission comment", async () => {
        expect(await SubmissionPS.executeUpdateSubmissionComment(1, "new")).to.deep.equal({
            "comment": "new",
            "id": 1,
            "submission_id": 1,
            "netid": "paulvanderlaan"
        });
    });

    /**
     * Delete review comment.
     */
    it("delete submission comment", async () => {
        expect(await SubmissionPS.executeDeleteSubmissionComment(1)).to.deep.equal({
            "comment": "Keep it up Brian!",
            "id": 1,
            "submission_id": 1,
            "netid": "paulvanderlaan"
        });
    });

});