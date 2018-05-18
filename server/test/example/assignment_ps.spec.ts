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
            "due_date": new Date("2018-05-01T20:30:00"),
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00"),
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
            "due_date": new Date("2018-05-01T20:30:00"),
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00"),
            course_id: 1
        }]);
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description", new Date("2018-07-01T20:30:00"), new Date("2018-06-01T20:30:00"), 1)).to.deep.equal([{
            course_id: 1,
            description: "Description",
            id: 2,
            title: "New",
            due_date: new Date("2018-07-01T20:30:00"),
            publish_date: new Date("2018-06-01T20:30:00"),
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