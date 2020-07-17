import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";

describe("API", () => {
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
    // initialize faculties and academic years
    await initializeData();
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

  // Test whether userinfo is returned
  test("Get /user info - netid", async () => {
    const sessionCookie = await mockLoginCookie(server, "henkjan");
    const res = await request(server)
      .get("/api/me")
      .set("cookie", sessionCookie);
    expect(res.status).toBe(200);
    expect(JSON.parse(res.text).netid).toBe("henkjan");
  });
});
