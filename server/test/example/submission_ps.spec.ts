import SubmissionPS from "../../src/prepared_statements/submissions_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-TestDataBase.sql");

describe("SubmissionPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
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

});