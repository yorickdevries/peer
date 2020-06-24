import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import Faculty from "../../src/models/Faculty";
import AcademicYear from "../../src/models/AcademicYear";

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
    // add some faculties and academic years
    //insert some faculties
    new Faculty("EEMCS").save();
    new Faculty("3ME").save();
    //insert some academic years
    new AcademicYear("2018/2019", false).save();
    new AcademicYear("2019/2020", true).save();
    new AcademicYear("2020/2021", true).save();
    new AcademicYear("2021/2022", false).save();
  });

  afterAll(async () => {
    //close server and connection
    server.close();
    await connection.close();
  });

  test("Integration test", async () => {
    let res; // will store all responses
    // log in as teacher
    const teacherCookie = await mockLoginCookie(server, "teacher");
    const teacherCookie2 = await mockLoginCookie(server, "anotherteacher");
    const studentCookie1 = await mockLoginCookie(server, "student1");

    // check whether the teacher is logged in
    res = await request(server)
      .get("/api/authenticated")
      .set("cookie", teacherCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toEqual({ authenticated: true });

    // get teacher userinfo
    res = await request(server).get("/api/me").set("cookie", teacherCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    // check netid correct
    expect(JSON.parse(res.text)).toMatchObject({
      netid: "teacher",
    });
    // check whether the affilition contains the employee entry
    expect(JSON.parse(res.text).affiliation).toMatchObject([
      { name: "employee" },
    ]);

    // get the current faculties
    res = await request(server)
      .get("/api/faculties")
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    expect(JSON.parse(res.text)).toMatchObject([
      { name: "3ME" },
      { name: "EEMCS" },
    ]);

    // get the current academic years
    res = await request(server)
      .get("/api/academicyears?active=true")
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    // here new academic years need to be added
    expect(JSON.parse(res.text)).toMatchObject([
      { name: "2019/2020", active: true },
      { name: "2020/2021", active: true },
    ]);

    // create a course
    res = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: true,
        faculty: "EEMCS",
        academicYear: "2019/2020",
        description: null,
      })
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    const course = JSON.parse(res.text);
    expect(course).toMatchObject({
      name: "CourseName",
      courseCode: "ABC123",
      enrollable: true,
      description: null,
    });

    // create another course as another teacher
    res = await request(server)
      .post("/api/courses")
      .send({
        name: "AntoherName",
        courseCode: "XYZ123",
        enrollable: false,
        faculty: "3ME",
        academicYear: "2019/2020",
        description: null,
      })
      .set("cookie", teacherCookie2);
    const course2 = JSON.parse(res.text);

    // fetch all the enrolled courses from the server
    // create a course
    res = await request(server)
      .get("/api/enrollments")
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      { courseId: course.id, role: "teacher" },
    ]);

    // check available courses as teacher
    res = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", teacherCookie);
    // assertions
    expect(JSON.parse(res.text).length).toEqual(0);

    // check available courses as student
    res = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", studentCookie1);
    // assertions
    expect(JSON.parse(res.text).length).toEqual(1);

    // enroll for course as student
    res = await request(server)
      .post("/api/enrollments")
      .set("cookie", studentCookie1)
      .send({ courseId: course.id });
    // assertions
    const enrollment = JSON.parse(res.text);
    expect(enrollment).toMatchObject({ courseId: course.id, role: "student" });

    // enroll for an unenrollable course
    res = await request(server)
      .post("/api/enrollments")
      .set("cookie", studentCookie1)
      .send({ courseId: course2.id });
    // assertions
    expect(res.status).toBe(400);
  });
});
