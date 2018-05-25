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
     * Test get submissions prepared statement.
     */
    it("get submissions list", async () => {
        expect(await SubmissionPS.executeGetSubmissions()).to.deep.equal([{
            id: 1,
            user_netid: "paulvanderlaan",
            assignment_id: 1,
            file_path: "submission1.pdf"
        },
        {
            id: 2,
            user_netid: "henkjan",
            assignment_id: 1,
            file_path: "submission2.pdf"
        }]);
    });

    /**
     * Test get submission by id prepared statement.
     */
    it("get submission by id", async () => {
        expect(await SubmissionPS.executeGetSubmissionById(1)).to.deep.equal({
            id: 1,
            user_netid: "paulvanderlaan",
            assignment_id: 1,
            file_path: "submission1.pdf"
        });
    });

    /**
     * Test creation of a submission prepared statement.
     */
    it("create submission", async () => {
        expect(await SubmissionPS.executeCreateSubmission("paulvanderlaan", 1, "filepathhere")).to.deep.equal({
            id: 3,
            user_netid: "paulvanderlaan",
            assignment_id: 1,
            file_path: "filepathhere"
        });
    });

    /**
     * Test delete submission by id prepared statement.
     */
    it("delete submission by id", async () => {
        expect(await SubmissionPS.executeDeleteSubmissionById(2)).to.deep.equal({
            id: 2,
            user_netid: "henkjan",
            assignment_id: 1,
            file_path: "submission2.pdf"
        });
    });

});