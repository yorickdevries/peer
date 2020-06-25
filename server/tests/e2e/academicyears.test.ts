import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import AcademicYear from "../../src/models/AcademicYear";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";

describe("Academic Years", () => {
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

  test("Get active academic years", async () => {
    //insert some academic years
    new AcademicYear("2018/2019", false).save();
    new AcademicYear("2019/2020", true).save();
    new AcademicYear("2020/2021", true).save();
    new AcademicYear("2021/2022", false).save();

    const sessionCookie = await mockLoginCookie(server, "user123");
    const res = await request(server)
      .get("/api/academicyears?active=true")
      .set("cookie", sessionCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      { name: "2019/2020", active: true },
      { name: "2020/2021", active: true },
    ]);
  });
});
