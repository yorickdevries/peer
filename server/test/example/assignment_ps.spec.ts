import AssignmentPS from "../../src/prepared_statements/assignment_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("AssignmentPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
    });

    /**
     * Test get assignments by course id.
     */
    it("get assignments by course id", async () => {
        expect([{
            "course_id": 1,
            "description": "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 1"
        }]).to.deep.equal(await AssignmentPS.executeGetAssignments(1));
    });

    /**
     * Test get assignments by course id and assignment id.
     */
    it("get assignments by course id and assignment id", async () => {
        expect(await AssignmentPS.executeGetAssignmentById(1, 1)).to.deep.equal([{
            title: "Assignment 1",
            description: "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            course_id: 1
        }]);
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description", new Date("2018-07-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z"), 1)).to.deep.equal([{
            course_id: 1,
            description: "Description",
            id: 2,
            title: "New",
            due_date: new Date("2018-07-01T20:30:00Z"),
            publish_date: new Date("2018-06-01T20:30:00Z"),
        }]);
    });

    /**
     * Test update assignments.
     */
    it("update assignment", async () => {
        expect(await AssignmentPS.executeUpdateAssignmentById("Updated", "updated", 1, 1)).to.deep.equal([{
            course_id: 1,
            description: "updated",
            id: 1,
            title: "Updated"
        }]);
    });
});