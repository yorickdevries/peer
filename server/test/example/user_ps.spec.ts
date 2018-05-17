import UserPS from "../../src/prepared_statements/user_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("UserPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
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