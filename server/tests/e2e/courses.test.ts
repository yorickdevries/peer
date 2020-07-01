import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";

describe("Courses", () => {
  let connection: Connection;
  let server: http.Server;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("Create a course", async () => {
    const sessionCookie = await mockLoginCookie(server, "teacher");
    const res = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: false,
        facultyName: "EEMCS",
        academicYearName: "2019/2020",
        description: null,
      })
      .set("cookie", sessionCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      name: "CourseName",
      courseCode: "ABC123",
      enrollable: false,
      description: null,
    });
  });

  test("Check enrollable courses", async () => {
    const teacherCookie = await mockLoginCookie(server, "teacher");

    // create a normal course
    const res1 = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName1",
        courseCode: "ABC123",
        enrollable: true,
        facultyName: "EEMCS",
        academicYearName: "2019/2020",
        description: null,
      })
      .set("cookie", teacherCookie);
    const course1 = JSON.parse(res1.text);

    // create a course in an inactive year
    const res2 = await request(server)
      .post("/api/courses")
      .send({
        name: "oldName",
        courseCode: "ABC123",
        enrollable: true,
        facultyName: "EEMCS",
        academicYearName: "2018/2019",
        description: null,
      })
      .set("cookie", teacherCookie);
    const course2 = JSON.parse(res2.text);

    // create a non-enrollable course
    const res3 = await request(server)
      .post("/api/courses")
      .send({
        name: "nonEnrollableCourse",
        courseCode: "ABC123",
        enrollable: false,
        facultyName: "EEMCS",
        academicYearName: "2019/2020",
        description: null,
      })
      .set("cookie", teacherCookie);
    const course3 = JSON.parse(res3.text);

    // log in as student
    const studentCookie = await mockLoginCookie(server, "student");
    // check available courses as student
    const res4 = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", studentCookie);
    // assertions
    const courses = JSON.parse(res4.text);
    expect(courses).toMatchObject([course1]);
    expect(courses).not.toMatchObject([course2, course3]);
  });
});
