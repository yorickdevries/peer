import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import Faculty from "../../src/models/Faculty";
import AcademicYear from "../../src/models/AcademicYear";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";

describe("Courses", () => {
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

  test("Create a course", async () => {
    //insert a faculty and academic year
    new Faculty("EEMCS").save();
    new AcademicYear("2019/2020", true).save();

    const sessionCookie = await mockLoginCookie(server, "teacher");
    const res = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: true,
        faculty: "EEMCS",
        academicYear: "2019/2020",
        description: null,
      })
      .set("cookie", sessionCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    expect(JSON.parse(res.text)).toMatchObject({
      name: "CourseName",
      courseCode: "ABC123",
      enrollable: true,
      description: null,
    });
  });
});
