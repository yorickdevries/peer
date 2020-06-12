import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import UserPS from "../../src/old_api/prepared_statements/user_ps";

describe("UserPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Test get user by id prepared statement.
     */
    it("get user by id", async () => {
        const user: any = await UserPS.executeGetUserById("paulvanderlaan");
        expect(user.netid).to.equal("paulvanderlaan");
        expect(user.email).to.equal("p.j.vanderlaan-1@student.tudelft.nl");
    });

});