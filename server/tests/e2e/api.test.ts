import http from "http";
import request from "supertest";
import app from "../../src/app";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import { dataSource } from "../../src/databaseConnection";

describe("API", () => {
  // will be initialized and closed in beforeAll / afterAll
  let server: http.Server;

  beforeAll(async () => {
    // For the in memory test database, the schema is automatically dropped upon connect
    await dataSource.initialize();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  afterAll(async () => {
    //close server and connection
    server.close();
    await dataSource.destroy();
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
