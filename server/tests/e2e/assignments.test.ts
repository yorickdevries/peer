import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import path from "path";
import initializeData from "../../src/util/initializeData";
import AssignmentType from "../../src/enum/AssignmentType";
import Course from "../../src/models/Course";
import publishAssignment from "../../src/assignmentProgression/publishAssignment";
import createAssignmentRequest from "../helpers/createAssignmentRequest";
import patchAssignmentRequest from "../helpers/patchAssignmentRequest";

describe("Assignments", () => {
  let connection: Connection;
  let server: http.Server;
  let course: Course;
  let exampleAssignmentFile: string;
  let sessionCookie: string;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  beforeEach(async () => {
    sessionCookie = await mockLoginCookie(server, "teacher");

    // create a course
    const res1 = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: false,
        facultyId: 1,
        academicYearId: 3,
        description: null,
      })
      .set("cookie", sessionCookie);

    course = JSON.parse(res1.text);

    // create am assignment course
    exampleAssignmentFile = path.resolve(
      __dirname,
      "../../exampleData/assignments/assignment1.pdf"
    );
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("make an assignment", async () => {
    const res2 = await createAssignmentRequest(
      server,
      course.id,
      exampleAssignmentFile,
      sessionCookie,
      AssignmentType.DOCUMENT
    );

    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toMatchObject({
      name: "Example title",
    });
  });

  test("make an assignment with invalid assignment type", async () => {
    const res2 = await createAssignmentRequest(
      server,
      course.id,
      exampleAssignmentFile,
      sessionCookie,
      "invalid"
    );

    expect(res2.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("invalid patch assignment with changed type", async () => {
    const res2 = await createAssignmentRequest(
      server,
      course.id,
      exampleAssignmentFile,
      sessionCookie,
      AssignmentType.DOCUMENT
    );

    const assignment = JSON.parse(res2.text);
    const res3 = await request(server)
      .post("/api/assignmentversions")
      .send({
        name: "Example version",
        assignmentId: assignment.id,
        reviewsPerUserPerAssignmentVersionToReview: 1,
      })
      .set("cookie", sessionCookie);

    expect(res3.status).toBe(HttpStatusCode.OK);
    await publishAssignment(assignment.id);

    const res4 = await patchAssignmentRequest(
      server,
      assignment.id,
      exampleAssignmentFile,
      sessionCookie,
      AssignmentType.CODE
    );

    expect(res4.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("valid patch assignment with changed type", async () => {
    const res2 = await createAssignmentRequest(
      server,
      course.id,
      exampleAssignmentFile,
      sessionCookie,
      AssignmentType.DOCUMENT
    );

    const assignment = JSON.parse(res2.text);
    const res3 = await request(server)
      .post("/api/assignmentversions")
      .send({
        name: "Example version",
        assignmentId: assignment.id,
        reviewsPerUserPerAssignmentVersionToReview: 1,
      })
      .set("cookie", sessionCookie);

    expect(res3.status).toBe(HttpStatusCode.OK);

    const res4 = await patchAssignmentRequest(
      server,
      assignment.id,
      exampleAssignmentFile,
      sessionCookie,
      AssignmentType.CODE
    );

    expect(res4.status).toBe(HttpStatusCode.OK);
  });

  // Makeshift parameterized test
  test("make an assignments with submission extensions", async () => {
    // [extensions, valid]
    const extensionsList: [string, boolean][] = [
      [".*", true],
      [".c, .cpp", true],
      [".", false],
      ["..", false],
      [".c_cpp", false],
      [".c, cpp", false],
    ];

    for (const extensions of extensionsList) {
      const res2 = await createAssignmentRequest(
        server,
        course.id,
        exampleAssignmentFile,
        sessionCookie,
        undefined,
        extensions[0]
      );

      if (extensions[1]) {
        expect(res2.status).toBe(HttpStatusCode.OK);
      } else {
        expect(res2.status).toBe(HttpStatusCode.BAD_REQUEST);
      }
    }
  });
});
