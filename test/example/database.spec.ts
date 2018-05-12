import database from "../../src/database";
import { expect } from "chai";
import "mocha";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/simpleUserDB.sql");

describe("Database Test", () => {
  // Make a clean database
  beforeEach((done) => {
    const db = database.db;
    // run the query file to start with a fresh database
    db.any(qf)
      .then(function () {
        done();
      });
  });

  it("connection port", () => {
    const result = database.connection.port;
    expect(result).to.equal(5432);
  });

  it("connection user", () => {
    const result = database.connection.user;
    expect(result).to.equal("postgres");
  });

  it("database connection", async () => {
    const db = database.db;
    let netid;
    const db_prom = db.any("SELECT * FROM usercollection")
      .then(function (result) {
        netid = result[0].netid;
      }).catch(function (err) {
        console.log(err);
      });

    // wait for database promise to finish
    await db_prom;
    expect(netid).to.equal("bob");
  });

});