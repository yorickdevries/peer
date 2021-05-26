import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";

describe("CodeAnnotations", () => {
  let connection: Connection;
  let server: http.Server;
  let sessionCookie: string;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  beforeEach(async () => {
    sessionCookie = await mockLoginCookie(server, "student", "student");
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("getMaxCommentLength", async () => {
    const res2 = await request(server)
    .get("/api/codeannotations/getMaxCommentLength")
    .set("cookie", sessionCookie);

    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text) === 255);
  });

});
