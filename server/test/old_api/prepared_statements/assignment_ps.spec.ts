import "mocha";
import { expect } from "chai";
import TestData from "../../test_helpers/test_data";

import AssignmentPS from "../../../src/old_api/prepared_statements/assignment_ps";

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
            review_evaluation_due_date: null,
            one_person_groups: false,
            review_evaluation: false,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("2018-05-03T20:30:00Z"),
            "review_publish_date": new Date("2018-05-02T20:30:00Z"),
            "title": "Assignment 1",
            "reviews_per_user": 2,
            external_link: null
        },
        {
            "course_id": 1,
            "description": "Example assignment number two",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment2.pdf",
            "id": 2,
            review_evaluation_due_date: null,
            one_person_groups: false,
            review_evaluation: false,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("9999-05-01T20:30:00Z"),
            "review_publish_date": new Date("2020-05-01T20:30:00Z"),
            "title": "Assignment 2",
            "reviews_per_user": 1,
            external_link: null
        },
        {
            "course_id": 1,
            "description": "Example assignment number three",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment3.pdf",
            "id": 3,
            review_evaluation_due_date: null,
            one_person_groups: false,
            review_evaluation: false,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("9999-05-01T20:30:00Z"),
            "review_publish_date": new Date("2020-05-01T20:30:00Z"),
            "title": "Assignment 3",
            "reviews_per_user": 1,
            external_link: null
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
            review_evaluation_due_date: null,
            one_person_groups: false,
            review_evaluation: false,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            course_id: 1,
            "reviews_per_user": 2,
            "review_due_date": new Date("2018-05-03T20:30:00Z"),
            "review_publish_date": new Date("2018-05-02T20:30:00Z"),
            external_link: null
        });
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description", 1, 2, "test_file.pdf",
        new Date("2017-07-01T20:30:00Z"), new Date("2018-07-01T20:30:00Z"), new Date("2019-07-01T20:30:00Z"), new Date("2020-07-01T20:30:00Z"), false, false, undefined
        )).to.deep.equal({
            id: 6,
            one_person_groups: false,
            review_evaluation: false,
            title: "New",
            description: "Description",
            course_id: 1,
            review_evaluation_due_date: null,
            filename: "test_file.pdf",
            reviews_per_user: 2,
            publish_date: new Date("2017-07-01T20:30:00Z"),
            due_date: new Date("2018-07-01T20:30:00Z"),
            review_publish_date: new Date("2019-07-01T20:30:00Z"),
            review_due_date: new Date("2020-07-01T20:30:00Z"),
            external_link: null
        });
    });

    /**
     * Test add assignments with all fields.
     */
    it("add assignment all fields", async () => {
        // Arrange
        const courseId = 1;
        const existing: any = await AssignmentPS.executeGetAssignments(courseId);

        // Act
        const created: any = await AssignmentPS.executeAddAssignment(
            "New",
            "Description",
            courseId,
            2,
            "test_file.pdf",
            new Date("2017-07-01T20:30:00Z"),
            new Date("2018-07-01T20:30:00Z"),
            new Date("2019-07-01T20:30:00Z"),
            new Date("2020-07-01T20:30:00Z"),
            false,
            false,
            "",
            new Date("2021-07-01T20:30:00Z"),
        );

        const newAssignment: any = await AssignmentPS.executeGetAssignmentById(created.id);
        const current: any = await AssignmentPS.executeGetAssignments(courseId);

        // Assert
        // Make sure a new assignment is added in the database
        expect(current.length).to.equal(existing.length + 1);

        // Add assignment returns the created assignment (created), as tested in an other test
        expect(newAssignment).to.deep.equal(created);
    });

    /**
     * Test update assignments.
     */
    it("update assignment", async () => {
        expect(await AssignmentPS.executeUpdateAssignmentById("Updated", "updated", 1, "filename", new Date("2018-06-01T20:30:00Z"), new Date("2018-06-01T20:31:00Z"), new Date("2018-06-01T20:32:00Z"), new Date("2018-06-01T20:33:00Z"), 1, "")).to.deep.equal({
            course_id: 1,
            description: "updated",
            filename: "filename",
            id: 1,
            review_evaluation_due_date: null,
            one_person_groups: false,
            review_evaluation: false,
            publish_date: new Date("2018-06-01T20:30:00Z"),
            due_date: new Date("2018-06-01T20:31:00Z"),
            review_publish_date: new Date("2018-06-01T20:32:00.000Z"),
            review_due_date: new Date("2018-06-01T20:33:00.000Z"),
            reviews_per_user: 1,
            title: "Updated",
            external_link: ""
        });
    });
});