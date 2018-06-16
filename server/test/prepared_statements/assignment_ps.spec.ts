import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import AssignmentPS from "../../src/prepared_statements/assignment_ps";

describe("AssignmentPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
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
            "review_due_date": new Date("9999-05-01T20:30:00Z"),
            "review_publish_date": new Date("2020-05-01T20:30:00Z"),
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
            "review_due_date": new Date("9999-05-01T20:30:00Z"),
            "review_publish_date": new Date("2020-05-01T20:30:00Z"),
            "title": "Assignment 2",
            "reviews_per_user": 1
        },
        {
            "course_id": 1,
            "description": "Example assignment number three",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment3.pdf",
            "id": 3,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("9999-05-01T20:30:00Z"),
            "review_publish_date": new Date("2020-05-01T20:30:00Z"),
            "title": "Assignment 3",
            "reviews_per_user": 1
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
            "review_due_date": new Date("9999-05-01T20:30:00Z"),
            "review_publish_date": new Date("2020-05-01T20:30:00Z")
        });
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description", 1, 2, "test_file.pdf",
        new Date("2017-07-01T20:30:00Z"), new Date("2018-07-01T20:30:00Z"), new Date("2019-07-01T20:30:00Z"), new Date("2020-07-01T20:30:00Z")
    )).to.deep.equal({
            id: 4,
            title: "New",
            description: "Description",
            course_id: 1,
            filename: "test_file.pdf",
            reviews_per_user: 2,
            publish_date: new Date("2017-07-01T20:30:00Z"),
            due_date: new Date("2018-07-01T20:30:00Z"),
            review_publish_date: new Date("2019-07-01T20:30:00Z"),
            review_due_date: new Date("2020-07-01T20:30:00Z")
    });
    });

    /**
     * Test update assignments.
     */
    it("update assignment", async () => {
        expect(await AssignmentPS.executeUpdateAssignmentById("Updated", "updated", 1, "filename", new Date("2018-06-01T20:30:00Z"), new Date("2018-06-01T20:31:00Z"), new Date("2018-06-01T20:32:00Z"), new Date("2018-06-01T20:33:00Z"), 1)).to.deep.equal({
            course_id: 1,
            description: "updated",
            filename: "filename",
            id: 1,
            publish_date: new Date("2018-06-01T20:30:00Z"),
            due_date: new Date("2018-06-01T20:31:00Z"),
            review_publish_date: new Date("2018-06-01T20:32:00.000Z"),
            review_due_date: new Date("2018-06-01T20:33:00.000Z"),
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

});