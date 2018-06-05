import SubmissionPS from "../../src/prepared_statements/submissions_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("SubmissionPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
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
            date: new Date("2018-05-01T20:30:00Z")
        });
    });

    /**
     * Test creation of a submission prepared statement.
     */
    it("create submission", async () => {
        expect(await SubmissionPS.executeCreateSubmission("paulvanderlaan", 10, 1, "filepathhere", new Date("2018-05-01T20:30:00Z"))).to.deep.equal({
            id: 7,
            group_id: 10,
            user_netid: "paulvanderlaan",
            assignment_id: 1,
            file_path: "filepathhere",
            date: new Date("2018-05-01T20:30:00Z")
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
            date: new Date("2018-05-01T20:30:00Z")
        });
    });

});