import Database from "../../src/database";
const databaseObject = new Database();
import { expect } from "chai";
import "mocha";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/simpleUserDB.sql");

describe("Database Test", () => {
  // Make a clean database
  beforeEach((done) => {
    const db = databaseObject.db;
    // run the query file to start with a fresh database
    db.any(qf)
      .then(function () {
        done();
      });
  });

  it("connection port", () => {
    const result = databaseObject.connection.port;
    expect(result).to.equal(5432);
  });

  it("connection user", () => {
    const result = databaseObject.connection.user;
    expect(result).to.equal("postgres");
  });

  it("database connection correct", async () => {
    const db = databaseObject.db;
    let result;
    const db_prom = db.any("SELECT * FROM usercollection")
      .then(function (data: any) {
        result = data[0].netid;
      }).catch(function (err: Error) {
        result = err.name;
      });

    // wait for database promise to finish
    await db_prom;
    expect(result).to.equal("bob");
  });

  it("database connection error", async () => {
    const db = databaseObject.db;
    let result;
    const db_prom = db.any("SELECT * FROM invalidtable")
      .then(function (data: any) {
        result = data[0].netid;
      }).catch(function (err: Error) {
        result = err.name;
      });

    // wait for database promise to finish
    await db_prom;
    expect(result).to.equal("error");
  });

});