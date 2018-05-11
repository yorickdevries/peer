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

});