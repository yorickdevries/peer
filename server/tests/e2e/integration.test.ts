import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";

describe("Integration", () => {
  // will be initialized and closed in beforeAll / afterAll
  let connection: Connection;
  let server: http.Server;

  beforeAll(async () => {
    // For the in memory test database, the schema is automatically dropped upon connect
    connection = await createDatabaseConnection();
    console.log(
      `Connected to ${connection.options.type} database: ${connection.options.database}`
    );
    server = http.createServer(app);
  });

  afterAll(async () => {
    //close server and connection
    server.close();
    await connection.close();
  });

  test("Integration test", async () => {
    // log in as teacher
    const teacherCookie = await mockLoginCookie(server, "teacher");

    // check whether the teacher is logged in
    const authResponse = await request(server)
      .get("/api/authenticated")
      .set("cookie", teacherCookie);
    expect(authResponse.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(authResponse.text)).toEqual({ authenticated: true });

    // get teacher userinfo
    const userinfoResponse = await request(server)
      .get("/api/me")
      .set("cookie", teacherCookie);
    expect(userinfoResponse.status).toBe(HttpStatusCode.OK);
    // check netid correct
    expect(JSON.parse(userinfoResponse.text)).toMatchObject({
      netid: "teacher",
    });
    // check whether the affilition contains the employee entry
    expect(JSON.parse(userinfoResponse.text).affiliation).toMatchObject([
      { name: "employee" },
    ]);
  });
});
