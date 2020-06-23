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
  });
});
