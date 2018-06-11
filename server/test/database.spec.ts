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

  it("connection port", () => {
    const result = Database.connection.port;
    expect(result).to.equal(5432);
  });

  it("connection user", () => {
    const result = Database.connection.user;
    expect(result).to.equal("postgres");
  });

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

  it("database query single result", async () => {
    const statement = new PreparedStatement("user-count",
    "SELECT COUNT(1) FROM userlist");
    const result = await Database.executeQuerySingleResult(statement);
    expect(result).to.deep.equal({ count: "4" });
  });

  it("database query any result", async () => {
    const statement = new PreparedStatement("get-all-users",
    "SELECT * FROM userlist");
    const result = await Database.executeQuery(statement);
    expect(result.length).to.equal(4);
  });

  it("database error query single result", async () => {
    const statement = new PreparedStatement("get-all-users2",
    "SELECT * FROM userlist");
    expect(Database.executeQuerySingleResult(statement)).to.eventually.be.rejectedWith(Error);
  });

  it("database error query any result", async () => {
    const statement = new PreparedStatement("invalid-query",
    "THIS IS NOT A VALID QUERY");
    expect(Database.executeQuery(statement)).to.eventually.be.rejectedWith(Error);
  });
});