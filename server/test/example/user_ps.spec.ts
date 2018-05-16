import Database from "../../src/database";
import UserPS from "../../src/prepared_statements/user_ps";
const databaseObject = new Database();

import { expect } from "chai";
import "mocha";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("UserPreparedStatements Test", () => {
    /**
     * Test get user by id prepared statement.
     */
    it("get user by id", async () => {
        let expectNetid = "wrong";
        let expectEmail = "wrong";

        const db_prom = UserPS.executeGetUserById("paulvanderlaan")
            .then(function (data: any) {
                expectNetid = data[0].netid;
                expectEmail = data[0].email;
            }).catch(function (err: Error) {

            });

        // wait for database promise to finish
        await db_prom;
        expect(expectNetid).to.equal("paulvanderlaan");
        expect(expectEmail).to.equal("p.j.vanderlaan-1@student.tudelft.nl");
    });

});