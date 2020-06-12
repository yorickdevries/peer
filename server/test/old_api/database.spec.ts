import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import TestData from "./test_helpers/test_data";

import Database from "../../../src/old_api/database";
import { PreparedStatement } from "pg-promise";

describe("Database Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Test the database connection.
     */
    it("database connection correct", async () => {
        const db = Database.db;
        let result;
        const dbPromise = db.any("SELECT * FROM userlist")
            .then(function (data: any) {
                result = data[0].netid;
            }).catch(function (err: Error) {
                result = err.name;
            });

        // wait for database promise to finish
        await dbPromise;
        expect(result).to.equal("paulvanderlaan");
    });

    /**
     * Test the database error handling.
     */
    it("database connection error", async () => {
        const db = Database.db;
        let result;
        const dbPromise = db.any("SELECT * FROM invalidtable")
            .then(function (data: any) {
                result = data[0].netid;
            }).catch(function (err: Error) {
                result = err.name;
            });

        // wait for database promise to finish
        await dbPromise;
        expect(result).to.equal("error");
    });

    /**
     * Test the single result query.
     */
    it("database query single result", async () => {
        const statement = new PreparedStatement({name: "user-count",
            text: "SELECT COUNT(1) FROM userlist"});
        const result = await Database.executeQuerySingleResult(statement);
        expect(result).to.deep.equal({ count: "6" });
    });

    /**
     * Tset the database query rany esult.
     */
    it("database query any result", async () => {
        const statement = new PreparedStatement({name: "get-all-users",
            text: "SELECT * FROM userlist"});
        const result = await Database.executeQuery(statement);
        expect(result.length).to.equal(6);
    });

    /**
     * Test the database error single result.
     */
    it("database error query single result", async () => {
        const statement = new PreparedStatement({name: "get-all-users2",
            text: "SELECT * FROM userlist"});
        await expect(Database.executeQuerySingleResult(statement)).to.eventually.be.rejectedWith("Multiple rows were not expected.");
    });

    /**
     * Test the database error any result.
     */
    it("database error query any result", async () => {
        const statement = new PreparedStatement({name: "invalid-query",
            text: "THIS IS NOT A VALID QUERY"});
        await expect(Database.executeQuery(statement)).to.eventually.be.rejected;
    });
});