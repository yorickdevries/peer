import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import User from "../../src/models/User";

async function setAdminUser(netid: string): Promise<void> {
  const adminUser = await User.findOneOrFail({ where: { netid } });
  adminUser.admin = true;
  await adminUser.save();
}

describe("Admin tests", () => {
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

  test("Admin Enroll", async () => {
    const teacherCookie = await mockLoginCookie(server, "teacher");
    const studentCookie = await mockLoginCookie(server, "student");
    const adminCookie = await mockLoginCookie(server, "admin");
    await setAdminUser("admin");

    let res = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: false,
        facultyId: 1,
        academicYearId: 3,
        description: null,
      })
      .set("cookie", teacherCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    const course = JSON.parse(res.text);

    //Ensure student cannot see the non-enrollable course
    res = await request(server)
      .get("/api/courses/enrollable")
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toEqual([]);

    //Ensure admin can see the non-enrollable course
    res = await request(server)
      .get("/api/courses/enrollable")
      .send()
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)[0].name).toEqual(course.name);

    //Ensure admin can enroll in non-enrollable course
    res = await request(server)
      .post(`/api/courses/${course.id}/adminEnroll`)
      .send()
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text).courseId).toEqual(course.id);

    //Ensure student cannot enroll in non-enrollable course via admin endpoint
    res = await request(server)
      .post(`/api/courses/${course.id}/adminEnroll`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure student cannot enroll in non-enrollable course via regular endpoint
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(res.text).toEqual("The course is not enrollable");

    //Ensure admin has been enrolled in non-enrollable course
    res = await request(server)
      .get(`/api/enrollments/enrolled`)
      .send()
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)[0].courseId).toEqual(course.id);
  });

  test("Faculty Edit", async () => {
    const studentCookie = await mockLoginCookie(server, "student");
    const adminCookie = await mockLoginCookie(server, "admin");
    await setAdminUser("admin");

    //Ensure admin can create new faculty
    let res = await request(server)
      .post("/api/faculties")
      .send({
        name: "FAC1",
        longName: "Faculty Number One",
      })
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    let faculty = JSON.parse(res.text);
    expect(faculty.name).toEqual("FAC1");
    expect(faculty.longName).toEqual("Faculty Number One");

    //Ensure new faculty has been created
    res = await request(server)
      .get(`/api/faculties/${faculty.id}`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    faculty = JSON.parse(res.text);
    expect(faculty.name).toEqual("FAC1");
    expect(faculty.longName).toEqual("Faculty Number One");

    //Ensure admin can change faculty
    res = await request(server)
      .patch(`/api/faculties/${faculty.id}`)
      .send({
        name: "FAC2",
        longName: "Faculty Number Two",
      })
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    faculty = JSON.parse(res.text);
    expect(faculty.name).toEqual("FAC2");
    expect(faculty.longName).toEqual("Faculty Number Two");

    //Ensure student can't create faculty
    res = await request(server)
      .post("/api/faculties/")
      .send({
        name: "FAC2",
        longName: "Faculty Number Two",
      })
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure student can't change faculty
    res = await request(server)
      .patch(`/api/faculties/${faculty.id}`)
      .send({
        name: "FAC2",
        longName: "Faculty Number Two",
      })
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure student can't delete faculty
    res = await request(server)
      .delete(`/api/faculties/${faculty.id}`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure admin can delete faculty
    res = await request(server)
      .delete(`/api/faculties/${faculty.id}`)
      .send()
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);

    //Ensure faculty was deleted
    res = await request(server)
      .get(`/api/faculties/${faculty.id}`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.NOT_FOUND);
  });

  test("Academic Year Edit", async () => {
    const studentCookie = await mockLoginCookie(server, "student");
    const adminCookie = await mockLoginCookie(server, "admin");
    await setAdminUser("admin");

    //Ensure admin can create new year
    let res = await request(server)
      .post("/api/academicyears")
      .send({
        name: "Y1",
        active: false,
      })
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    let year = JSON.parse(res.text);
    expect(year.name).toEqual("Y1");
    expect(year.active).toEqual(false);

    //Ensure new year has been created
    res = await request(server)
      .get(`/api/academicyears/${year.id}`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    year = JSON.parse(res.text);
    expect(year.name).toEqual("Y1");
    expect(year.active).toEqual(false);

    //Ensure admin can change year
    res = await request(server)
      .patch(`/api/academicyears/${year.id}`)
      .send({
        name: "Y2",
        active: true,
      })
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    year = JSON.parse(res.text);
    expect(year.name).toEqual("Y2");
    expect(year.active).toEqual(true);

    //Ensure student can't create year
    res = await request(server)
      .post("/api/academicyears/")
      .send({
        name: "FAC2",
        active: true,
      })
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure student can't change year
    res = await request(server)
      .patch(`/api/academicyears/${year.id}`)
      .send({
        name: "FAC2",
        active: true,
      })
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure student can't delete year
    res = await request(server)
      .delete(`/api/academicyears/${year.id}`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    //Ensure admin can delete year
    res = await request(server)
      .delete(`/api/academicyears/${year.id}`)
      .send()
      .set("cookie", adminCookie);
    expect(res.status).toBe(HttpStatusCode.OK);

    //Ensure year was deleted
    res = await request(server)
      .get(`/api/academicyears/${year.id}`)
      .send()
      .set("cookie", studentCookie);
    expect(res.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});
