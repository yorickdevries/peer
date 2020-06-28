import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import fs from "fs";
import path from "path";
import mockDate from "mockdate";

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
    // initialize faculties and academic years
    await initializeData();
  });

  afterAll(async () => {
    mockDate.reset();
    //close server and connection
    server.close();
    await connection.close();
  });

  test("Integration test", async () => {
    let res; // will store all responses
    // log in as teacher
    const teacherCookie = await mockLoginCookie(server, "teacher");
    const teacherCookie2 = await mockLoginCookie(server, "anotherteacher");
    const studentCookie1 = await mockLoginCookie(server, "student1", "student");
    const studentCookie2 = await mockLoginCookie(server, "student2", "student");

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
    // check whether the affiliation contains the employee entry
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
    expect(JSON.parse(res.text)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "3mE" }),
        expect.objectContaining({ name: "EEMCS" }),
      ])
    );

    // get the current academic years
    res = await request(server)
      .get("/api/academicyears?active=true")
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    // here new academic years need to be added
    expect(JSON.parse(res.text)).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "2019/2020" })])
    );

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

    // create a course as student
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
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

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
      .get("/api/enrollments/enrolled")
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

    // make an assingment for the course
    // create am assignment course
    const exampleAssignmentFile = path.resolve(
      __dirname,
      "../../example_data/assignments/assignment1.pdf"
    );
    res = await request(server)
      .post("/api/assignments")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("reviewsPerUser", 2)
      .field("enrollable", true)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-01-01T10:00Z").toISOString())
      .field("dueDate", new Date("2020-02-01T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-03-01T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-04-01T10:00Z").toISOString())
      .field("reviewEvaluationDueDate", "null")
      .field("description", "Example description")
      .field("externalLink", "null");
    expect(res.status).toBe(HttpStatusCode.OK);
    const assignment = JSON.parse(res.text);
    expect(assignment).toMatchObject({
      name: "Example title",
    });

    // set date to the moment that the assignment is published
    mockDate.set(new Date("2020-01-15T10:00Z"));

    // check available courses as student
    res = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", studentCookie1);
    // assertions
    expect(JSON.parse(res.text).length).toEqual(1);

    // enroll for course as student
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", studentCookie1);
    // assertions
    const enrollment1 = JSON.parse(res.text);
    expect(enrollment1).toMatchObject({
      courseId: course.id,
      role: "student",
    });

    // enroll for course as student
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", studentCookie2);
    // assertions
    const enrollment2 = JSON.parse(res.text);
    expect(enrollment2).toMatchObject({
      courseId: course.id,
      role: "student",
    });

    // enroll for course as student for the second time
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);

    // enroll for an unenrollable course
    res = await request(server)
      .post(`/api/courses/${course2.id}/enroll`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);

    // get enrollments
    res = await request(server)
      .get("/api/enrollments/enrolled")
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      {
        role: "student",
        courseId: course.id,
      },
    ]);
    expect(JSON.parse(res.text)).not.toMatchObject([
      {
        courseId: course2.id,
      },
    ]);

    // get enrolled assignments
    res = await request(server)
      .get(`/api/assignments/enrolled?courseId=${course.id}`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([]);

    // get available assignments
    res = await request(server)
      .get(`/api/assignments/enrollable?courseId=${course.id}`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      {
        id: assignment.id,
      },
    ]);

    // enroll in assignment
    res = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    const group1 = JSON.parse(res.text);
    expect(group1).toMatchObject({
      name: "student1",
    });

    // enroll in assignment
    res = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", studentCookie2);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    const group2 = JSON.parse(res.text);
    expect(group2).toMatchObject({
      name: "student2",
    });

    // get enrolled assignments
    res = await request(server)
      .get(`/api/assignments/enrolled?courseId=${course.id}`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      {
        id: assignment.id,
      },
    ]);

    // get available assignments
    res = await request(server)
      .get(`/api/assignments/enrollable?courseId=${course.id}`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).not.toMatchObject([
      {
        id: assignment.id,
      },
    ]);

    // get group
    res = await request(server)
      .get(`/api/groups/enrolled?assignmentId=${assignment.id}`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(group1);

    // get all groups by the teacher
    res = await request(server)
      .get(`/api/groups?assignmentId=${assignment.id}`)
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([group1, group2]);

    // get all groups by the student
    res = await request(server)
      .get(`/api/groups?assignmentId=${assignment.id}`)
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);

    // make a submission
    const exampleSubmissionFile1 = path.resolve(
      __dirname,
      "../../example_data/submissions/submission1.pdf"
    );
    res = await request(server)
      .post("/api/submissions")
      .set("cookie", studentCookie1)
      .attach(
        "file",
        fs.readFileSync(exampleSubmissionFile1),
        "submission1.pdf"
      )
      .field("groupId", group1.id)
      .field("assignmentId", assignment.id);

    expect(res.status).toBe(HttpStatusCode.OK);
    const submission1 = JSON.parse(res.text);

    // make a submission
    const exampleSubmissionFile2 = path.resolve(
      __dirname,
      "../../example_data/submissions/submission2.pdf"
    );
    res = await request(server)
      .post("/api/submissions")
      .set("cookie", studentCookie2)
      .attach(
        "file",
        fs.readFileSync(exampleSubmissionFile2),
        "submission2.pdf"
      )
      .field("groupId", group2.id)
      .field("assignmentId", assignment.id);

    expect(res.status).toBe(HttpStatusCode.OK);
    const submission2 = JSON.parse(res.text);

    // get all submissions for this assignment by this group
    res = await request(server)
      .get(
        `/api/submissions/enrolled?assignmentId=${assignment.id}&groupId=${group1.id}`
      )
      .set("cookie", studentCookie1);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([submission1]);

    // get all submissions for this assignment as teacher
    res = await request(server)
      .get(`/api/submissions?assignmentId=${assignment.id}`)
      .set("cookie", teacherCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([submission1, submission2]);
  });
});
