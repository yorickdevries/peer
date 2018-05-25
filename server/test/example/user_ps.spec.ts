import UserPS from "../../src/prepared_statements/user_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("UserPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });

    /**
     * Test get user by id prepared statement.
     */
    it("get user by id", async () => {
        expect(await UserPS.executeGetUserById("paulvanderlaan")).to.deep.equal([{
            netid: "paulvanderlaan",
            email: "p.j.vanderlaan-1@student.tudelft.nl"
        }]);
    });

});