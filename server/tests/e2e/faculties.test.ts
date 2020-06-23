import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import Faculty from "../../src/models/Faculty";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";

describe("E2E API", () => {
  let connection: Connection;
  let server: http.Server;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("Get all faculties", async () => {
    //insert some faculties
    new Faculty("EEMCS").save();
    new Faculty("3ME").save();

    const sessionCookie = await mockLoginCookie(server, "user123");
    const res = await request(server)
      .get("/api/faculties")
      .set("cookie", sessionCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    expect(JSON.parse(res.text)).toMatchObject([
      { name: "3ME" },
      { name: "EEMCS" },
    ]);
  });
});
