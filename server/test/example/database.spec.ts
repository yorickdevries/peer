import Database from "../../src/database";
import UserPS from "../../src/prepared_statements/user_ps";
const databaseObject = new Database();

import { expect } from "chai";
import "mocha";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("Database Test", () => {
  // Make a clean database
  beforeEach((done) => {
    databaseObject.DatabaseImport(qf).then(done);
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
    const db_prom = db.any("SELECT * FROM userlist")
      .then(function (data: any) {
        result = data[0].netid;
      }).catch(function (err: Error) {
        result = err.name;
      });

    // wait for database promise to finish
    await db_prom;
    expect(result).to.equal("paulvanderlaan");
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

  // Tests database execute query, with a prepared statement.
  // execute methods of class UserPs (user_ps.ts) are not used in the test,
  // since a response object is needed -> hard to make. This test method
  // Manually does what all execute methods do in UserPS.
    it("database executeQuery() test", async () => {
        let result;

        // Bind value.
        UserPS.getUserById.values = ['paulvanderlaan'];

        const db_prom = databaseObject.executeQuery(UserPS.getUserById)
            .then(function (data: any) {
                result = data[0].netid;
            }).catch(function (err: Error) {
                result = err.name;
            });

        // wait for database promise to finish
        await db_prom;
        expect(result).to.equal("paulvanderlaan");
    });

});