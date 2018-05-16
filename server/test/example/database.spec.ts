import Database from "../../src/database";
import { expect } from "chai";
import "mocha";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("Database Test", () => {
  // Make a clean database
  beforeEach((done) => {
    Database.DatabaseImport(qf).then(done);
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