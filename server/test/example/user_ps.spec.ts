import UserPS from "../../src/prepared_statements/user_ps";
import { expect } from "chai";
import "mocha";

describe("UserPreparedStatements Test", () => {
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