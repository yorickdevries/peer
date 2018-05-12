import database from "../../src/database";
import { expect } from "chai";
import "mocha";

describe("Database Test", () => {

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