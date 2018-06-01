import AuthorizationPS from "../../src/prepared_statements/authorization_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("AuthorizationPreparedstatements Test", () => {
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
    it("checkenrollment by id", async () => {
        expect(await AuthorizationPS.executeCheckEnrollment(1, "paulvanderlaan")).to.deep.equal({
            "exists": true
        });
    });

    /**
     * Test get submission by id prepared statement, failing.
     */
    it("checkenrollment by id fail", async () => {
        expect(await AuthorizationPS.executeCheckEnrollment(1, "henkjan")).to.deep.equal({
            "exists": false
        });
    });

    /**
     * Test to check enrollment as teacher
     */
    it("check enrollment teacher", async () => {
        expect(await AuthorizationPS.executeCheckEnrollmentAsTeacher(1, "paulvanderlaan")).to.deep.equal({
            "exists": false
        });
    });

    /**
     * Test to check enrollment as teacher or ta
     */
    it("check enrollment teacher or ta", async () => {
        expect(await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(1, "paulvanderlaan")).to.deep.equal({
            "exists": false
        });
    });

});