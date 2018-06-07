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
    it("get assignments by course id1", async () => {
        expect([{
            "course_id": 1,
            "description": "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment1.pdf",
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("2018-05-01T20:30:00Z"),
            "review_publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 1",
            "reviews_per_user": 2,
        },
        {
            "course_id": 1,
            "description": "Example assignment number two",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment2.pdf",
            "id": 2,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("2018-05-01T20:30:00Z"),
            "review_publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 2",
            "reviews_per_user": 2
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
            course_id: 1,
            "reviews_per_user": 2,
            "review_due_date": new Date("2018-05-01T20:30:00Z"),
            "review_publish_date": new Date("2018-04-01T20:30:00Z")
        });
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description", new Date("2018-07-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z"), 1, 2, "test_file.pdf",
            new Date("2018-07-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z")
    )).to.deep.equal({
            course_id: 1,
            description: "Description",
            id: 3,
            title: "New",
            due_date: new Date("2018-07-01T20:30:00Z"),
            filename: "test_file.pdf",
            publish_date: new Date("2018-06-01T20:30:00Z"),
            "review_due_date": new Date("2018-07-01T20:30:00Z"),
            "review_publish_date": new Date("2018-06-01T20:30:00Z"),
            "reviews_per_user": 2

    });
    });

    /**
     * Test update assignments.
     */
    it("update assignment", async () => {
        expect(await AssignmentPS.executeUpdateAssignmentById("Updated", "updated", 1,1, new Date("2018-06-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z"), 1, "filename", new Date("2018-06-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z"))).to.deep.equal({
            course_id: 1,
            description: "updated",
            due_date: new Date("2018-06-01T20:30:00Z"),
            filename: "filename",
            id: 1,
            publish_date: new Date("2018-06-01T20:30:00Z"),
            review_due_date: new Date("2018-06-01T20:30:00.000Z"),
            review_publish_date: new Date("2018-06-01T20:30:00.000Z"),
            reviews_per_user: 1,
            title: "Updated"
        });
    });


    /**
     * Test get review assignment.
     */
    it("get review", async () => {
        const result = await AssignmentPS.executeGetReviewByAssignmentId(1, "henkjan");
        expect(result).to.deep.equal({
            "done": false,
            "id": 1,
            "rubric_assignment_id": 1,
            "submission_id": 1,
            "grade": -1,
            "user_netid": "henkjan",
            "creation_date": result.creation_date

        });
    });



    /**
     * Test create review.
     */
    it("create review", async () => {
        expect(await AssignmentPS.executeCreateReviewByAssignmentId("paulvanderlaan", 1, 1)).to.deep.equal({
            "done": false,
            "id": 3,
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
            "group_id": 10,
            "grade": -1,
            "assignment_id": 1,
            "user_netid": "paulvanderlaan",
            "date": new Date("2018-05-01T20:30:00Z")
        },
        {
            "file_path": "submission2.pdf",
            "id": 2,
            "group_id": 10,
            "grade": -1,
            "assignment_id": 1,
            "user_netid": "henkjan",
            "date": new Date("2018-05-01T20:30:00Z")
        }]);
    });

    /**
     * Test get reviews for an assignment.
     */
    it("Reviews of an assignment", async () => {
        expect(await AssignmentPS.executeGetReviewsById(1)).to.deep.equal([{
            "reviewer": "paulvanderlaan",
            "submitter": "henkjan"
        }]);
    });

});