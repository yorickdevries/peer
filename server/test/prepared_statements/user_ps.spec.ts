import UserPS from "../../src/prepared_statements/user_ps";
import { expect } from "chai";
import "mocha";
import TestDatabase from "../test_helpers/test_database";

describe("UserPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestDatabase.initialize();
    });

    /**
     * Test get user by id prepared statement.
     */
    it("get user by id", async () => {
        expect(await UserPS.executeGetUserById("paulvanderlaan")).to.deep.equal({
            netid: "paulvanderlaan",
            email: "p.j.vanderlaan-1@student.tudelft.nl"
        });
    });

});