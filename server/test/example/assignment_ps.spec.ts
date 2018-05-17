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
        expect(await AssignmentPS.executeGetAssignments(1)).to.deep.equal([{
            title: "Assignment 1",
            description: "Example assignment number one",
            id: 1,
            course_id: 1
        }]);
    });

    /**
     * Test get assignments by course id and assignment id.
     */
    it("get assignments by course id and assignment id", async () => {
        expect(await AssignmentPS.executeGetAssignmentById(1, 1)).to.deep.equal([{
            title: "Assignment 1",
            description: "Example assignment number one",
            id: 1,
            course_id: 1
        }]);
    });

    /**
     * Test add assignments.
     */
    it("add assignment", async () => {
        expect(await AssignmentPS.executeAddAssignment("New", "Description")).to.deep.equal([{
            course_id: 1,
            description: "Description",
            id: 2,
            title: "New"
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