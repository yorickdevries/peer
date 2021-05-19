import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import fs from "fs";
import path from "path";
import createDatabaseConnection from "../../src/databaseConnection";
import initializeData from "../../src/util/initializeData";
import mockLoginCookie from "../helpers/mockLoginCookie";
import createAssignmentRequest from "../helpers/createAssignmentRequest";
import AssignmentVersion from "../../src/models/AssignmentVersion";
import Group from "../../src/models/Group";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import AssignmentType from "../../src/enum/AssignmentType";
import publishAssignment from "../../src/assignmentProgression/publishAssignment";

describe("Submissions", () => {
  let connection: Connection;
  let server: http.Server;
  let sessionCookie: string;
  let assignmentVersion: AssignmentVersion;
  let group: Group;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  beforeEach(async () => {
    const teacherCookie = await mockLoginCookie(server, "teacher");
    sessionCookie = await mockLoginCookie(server, "student", "student");

    // create a course
    const res1 = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: true,
        facultyId: 1,
        academicYearId: 3,
        description: null,
      })
      .set("cookie", teacherCookie);
    const course = JSON.parse(res1.text);

    // create an assignment
    const res2 = await createAssignmentRequest(
      server,
      course.id,
      teacherCookie,
      AssignmentType.CODE,
      ".c, .h"
    );
    const assignment = JSON.parse(res2.text);

    // create an assignment version
    const res3 = await request(server)
      .post("/api/assignmentversions/")
      .send({
        name: "default",
        assignmentId: assignment.id,
        reviewsPerUserPerAssignmentVersionToReview: 1,
      })
      .set("cookie", teacherCookie);
    assignmentVersion = JSON.parse(res3.text);

    // publish assignment
    await publishAssignment(assignment.id);
    // enroll in course
    await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", sessionCookie);

    // enroll in assignment
    const res4 = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", sessionCookie);
    group = JSON.parse(res4.text);
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("make a submission with valid file type", async () => {
    const exampleSubmissionFile = path.resolve(
      __dirname,
      "../../exampleData/submissions/submission1.pdf"
    );
    const res = await request(server)
      .post("/api/submissions")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleSubmissionFile), "submission1.c")
      .field("groupId", group.id)
      .field("assignmentVersionId", assignmentVersion.id);

    expect(res.status).toBe(HttpStatusCode.OK);
  });

  test("make a submission with invalid file type", async () => {
    const exampleSubmissionFile = path.resolve(
      __dirname,
      "../../exampleData/submissions/submission1.pdf"
    );
    const res = await request(server)
      .post("/api/submissions")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleSubmissionFile), "submission1.cpp")
      .field("groupId", group.id)
      .field("assignmentVersionId", assignmentVersion.id);

    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);
  });
});
