import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import TestData from "./test_helpers/test_data";

import Database from "../src/database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

describe("Database Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Test the connection port.
     */
    it("connection port", () => {
        const result = Database.connection.port;
        expect(result).to.equal(5432);
    });

    /**
     * Test the user connection.
     */
    it("connection user", () => {
        const result = Database.connection.user;
        expect(result).to.equal("postgres");
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
        const statement = new PreparedStatement("user-count",
            "SELECT COUNT(1) FROM userlist");
        const result = await Database.executeQuerySingleResult(statement);
        expect(result).to.deep.equal({ count: "4" });
    });

    /**
     * Tset the database query rany esult.
     */
    it("database query any result", async () => {
        const statement = new PreparedStatement("get-all-users",
            "SELECT * FROM userlist");
        const result = await Database.executeQuery(statement);
        expect(result.length).to.equal(4);
    });

    /**
     * Test the database error single result.
     */
    it("database error query single result", async () => {
        const statement = new PreparedStatement("get-all-users2",
            "SELECT * FROM userlist");
        await expect(Database.executeQuerySingleResult(statement)).to.eventually.be.rejectedWith("Multiple rows were not expected.");
    });

    /**
     * Test the database error any result.
     */
    it("database error query any result", async () => {
        const statement = new PreparedStatement("invalid-query",
            "THIS IS NOT A VALID QUERY");
        await expect(Database.executeQuery(statement)).to.eventually.be.rejected;
    });
});