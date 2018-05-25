import Database from "../../src/database";

import { expect } from "chai";
import "mocha";

// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("Database Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
      await Database.DatabaseDrop();
      await Database.DatabaseImport(qfSchema);
      await Database.DatabaseImport(qfData);
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
});