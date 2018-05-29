import AssignmentPS from "../../src/prepared_statements/assignment_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("AssignmentPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });

    /**
     * Test get assignments by course id.
     */
    it("get assignments by course id", async () => {
        expect([{
            "course_id": 1,
            "description": "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment1.pdf",
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 1"
        }]).to.deep.equal(await AssignmentPS.executeGetAssignments(1));
    });

    /**
     * Test get assignments by course id and assignment id.
     */
    it("get assignments by course id and assignment id", async () => {
        expect(await AssignmentPS.executeGetAssignmentById(1)).to.deep.equal({
            title: "Assignment 1",
            description: "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment1.pdf",
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            course_id: 1
        });
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description", new Date("2018-07-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z"), 1, "test_file.pdf"
    )).to.deep.equal({
            course_id: 1,
            description: "Description",
            id: 2,
            title: "New",
            due_date: new Date("2018-07-01T20:30:00Z"),
            filename: "test_file.pdf",
            publish_date: new Date("2018-06-01T20:30:00Z"),
        });
    });

    /**
     * Test update assignments.
     */
    it("update assignment", async () => {
        expect(await AssignmentPS.executeUpdateAssignmentById("Updated", "updated", 1, 1)).to.deep.equal({
            course_id: 1,
            description: "updated",
            filename: "assignment1.pdf",
            id: 1,
            title: "Updated"
        });
    });


    /**
     * Test get review assignment.
     */
    it("get review", async () => {
        expect(await AssignmentPS.executeGetReviewByAssignmentId(1, "henkjan")).to.deep.equal({
            "comment": "Plagiaat",
            "done": false,
            "id": 1,
            "rubric_assignment_id": 1,
            "submission_id": 1,
            "user_netid": "henkjan"

        });
    });



    /**
     * Test create review.
     */
    it("create review", async () => {
        expect(await AssignmentPS.executeCreateReviewByAssignmentId("paulvanderlaan", 1, 1)).to.deep.equal({
            "comment": "",
            "done": false,
            "id": 2,
            "rubric_assignment_id": 1,
            "submission_id": 1,
            "user_netid": "paulvanderlaan"

        });
    });

    /**
     * Test get all submissions.
     */
    it("get all submissions", async () => {
        expect(await AssignmentPS.executeGetAllSubmissionsByAssignmentId(1)).to.deep.equal([{
            "file_path": "submission1.pdf",
            "id": 1,
            "assignment_id": 1,
            "user_netid": "paulvanderlaan"
        },
        {
            "file_path": "submission2.pdf",
            "id": 2,
            "assignment_id": 1,
            "user_netid": "henkjan"
        }]);
    });

    /**
     * Test count reviews for assignment.
     */
    it("Count reviews for assignment", async () => {
        expect(await AssignmentPS.executeCountAssignmentReviews(1, "henkjan")).to.deep.equal({
            count: "1"
        });
    });
});