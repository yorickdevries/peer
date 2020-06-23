import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";

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
    const randomUser = `user${Math.floor(Math.random() * 1000)}`;
    const sessionCookie = await mockLoginCookie(server, randomUser);
    const response = await request(server)
      .get("/api/authenticated")
      .set("cookie", sessionCookie);
    // assertions
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(response.text)).toEqual({ authenticated: true });
  });
});
