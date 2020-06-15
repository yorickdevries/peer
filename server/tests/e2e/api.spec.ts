import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode"

describe("E2E API", () => {
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

  test("check /me route without logging in", async () => {
    const response = await request(server).get("/api/me");
    expect(response.status).toBe(HttpStatusCode.UNAUTHORIZED);
  });

  test("check /authenticated route without logging in", async () => {
    const response = await request(server).get("/api/authenticated");
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(response.text)).toEqual({ authenticated: false });
  });

  test("check /authenticated route with logging in", async () => {
    // perform a mocklogin with random user
    const response1 = await request(server)
      .post("/api/mocklogin")
      .send({
        netid: `user${Math.floor(Math.random() * 1000)}`,
        affiliation: "employee",
      });
    //save the session cookie
    const sessionCookie = response1.header["set-cookie"];
    const response2 = await request(server)
      .get("/api/authenticated")
      .set("cookie", sessionCookie);
    // assertions
    expect(response2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(response2.text)).toEqual({ authenticated: true });
  });
});
