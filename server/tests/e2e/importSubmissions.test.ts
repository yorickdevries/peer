/*
import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import fs from "fs";
import path from "path";
import createDatabaseConnection from "../../src/databaseConnection";
import AssignmentType from "../../src/enum/AssignmentType";
import AssignmentVersion from "../../src/models/AssignmentVersion";
import initializeData from "../../src/util/initializeData";
import createAssignmentRequest from "../helpers/createAssignmentRequest";
import mockLoginCookie from "../helpers/mockLoginCookie";
import User from "../../src/models/User";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import Enrollment from "../../src/models/Enrollment";
import UserRole from "../../src/enum/UserRole";
import Assignment from "../../src/models/Assignment";

describe("Submission import", () => {
  // will be initialized and closed in beforeEach / afterEach
  let connection: Connection;
  let server: http.Server;
  let teacherCookie: string;
  let assignmentVersionId: number;
  let assignmentId: number;
  let courseId: number;
  let exampleFile: Buffer;

  const submissionCount = 10;

  beforeAll(async () => {
    // this file has the following structure
    // assignment
    // - submissions
    //   for n from 0 to 9
    //   - 100000n_Mr_Student
    //     - main.c
    const filePath = path.resolve(
      __dirname,
      "../../exampleData/submissionImports/weblab.zip"
    );

    exampleFile = fs.readFileSync(filePath);
  });

  beforeEach(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
    teacherCookie = await mockLoginCookie(server, "teacher");

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
    courseId = course.id;

    // create an assignment
    const res2 = await createAssignmentRequest(
      server,
      course.id,
      teacherCookie,
      AssignmentType.CODE,
      ".zip",
      false
    );
    const assignment = JSON.parse(res2.text);
    assignmentId = assignment.id;

    // create an assignment version
    const res3 = await request(server)
      .post("/api/assignmentversions/")
      .send({
        name: "default",
        assignmentId: assignment.id,
        reviewsPerUserPerAssignmentVersionToReview: 1,
      })
      .set("cookie", teacherCookie);
    const assignmentVersion = JSON.parse(res3.text);
    assignmentVersionId = assignmentVersion.id;

    for (let i = 0; i < submissionCount; i++) {
      const netid = `mrstudent${i}`;
      const user = await new User(
        netid,
        undefined,
        undefined,
        undefined,
        1000000 + i,
        "Mr",
        null,
        "Student",
        null,
        null
      ).save();
      // enroll user in course
      await new Enrollment(user, course, UserRole.STUDENT).save();
    }
  });

  afterEach(async () => {
    //close server and connection
    server.close();
    await connection.close();
  });

  test("import submissions from weblab export", async () => {
    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersionId);

    expect(res.status).toBe(HttpStatusCode.OK);

    // timeout needs te be set as submission import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const assignmentVersion = (await AssignmentVersion.findOne(
      assignmentVersionId
    ))!;
    const submissions = await assignmentVersion.getSubmissions();
    expect(submissions.length).toBe(submissionCount);
    for (const submission of submissions) {
      const user = await submission.getUser();
      expect(user.studentNumber).toBeGreaterThanOrEqual(1000000);
      expect(user.studentNumber).toBeLessThan(1000000 + submissionCount);
      await submission.validateOrReject();
    }
  });

  test("import submissions from empty zip", async () => {
    const filePath = path.resolve(
      __dirname,
      "../../exampleData/submissions/empty.zip"
    );

    const emptyFile = fs.readFileSync(filePath);

    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", emptyFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersionId);

    expect(res.status).toBe(HttpStatusCode.OK);

    // timeout needs te be set as submission import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const assignmentVersion = (await AssignmentVersion.findOne(
      assignmentVersionId
    ))!;
    const submissions = await assignmentVersion.getSubmissions();
    expect(submissions.length).toBe(0);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const assignment = (await Assignment.findOne(assignmentId))!;
    const groups = await assignment.getGroups();
    expect(groups.length).toBe(0);
  });

  test("import submissions from weblab export with missing student", async () => {
    const netid = "mrstudent9";
    await connection.manager.delete(Enrollment, { userNetid: netid });
    await connection.manager.delete(User, { netid });

    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersionId);

    expect(res.status).toBe(HttpStatusCode.OK);

    // timeout needs te be set as submission import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const assignmentVersion = (await AssignmentVersion.findOne(
      assignmentVersionId
    ))!;
    const submissions = await assignmentVersion.getSubmissions();
    expect(submissions.length).toBe(submissionCount - 1);
    for (const submission of submissions) {
      const user = await submission.getUser();
      expect(user.studentNumber).toBeGreaterThanOrEqual(1000000);
      expect(user.studentNumber).toBeLessThan(1000000 + submissionCount - 1);
      await submission.validateOrReject();
    }
  });

  test("import submissions with existing groups", async () => {
    const res1 = await request(server)
      .post("/api/groups/")
      .set("cookie", teacherCookie)
      .send({
        name: "group",
        assignmentId: assignmentId,
      });
    const group = JSON.parse(res1.text);

    await request(server)
      .post(`/api/groups/${group.id}/adduser`)
      .set("cookie", teacherCookie)
      .field("userNetid", "mrstudent0");

    const res2 = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersionId);

    expect(res2.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("import submissions with existing submission", async () => {
    const res1 = await request(server)
      .post("/api/groups/")
      .set("cookie", teacherCookie)
      .send({
        name: "group",
        assignmentId: assignmentId,
      });
    const group = JSON.parse(res1.text);

    await request(server)
      .post(`/api/groups/${group.id}/adduser`)
      .set("cookie", teacherCookie)
      .field("userNetid", "mrstudent0");

    const studentCookie = await mockLoginCookie(
      server,
      "mrstudent0",
      "student"
    );
    await request(server)
      .post("/api/submissions")
      .set("cookie", studentCookie)
      .attach("file", exampleFile, "")
      .field("groupId", group.id)
      .field("assignmentVersionId", assignmentVersionId);

    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersionId);

    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("import submissions to document assignment", async () => {
    const res2 = await createAssignmentRequest(
      server,
      courseId,
      teacherCookie,
      AssignmentType.DOCUMENT,
      ".zip",
      false
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
    const assignmentVersion = JSON.parse(res3.text);

    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersion.id);

    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("import submissions to enrollable assignment", async () => {
    const res2 = await createAssignmentRequest(
      server,
      courseId,
      teacherCookie,
      AssignmentType.CODE,
      ".zip"
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
    const assignmentVersion = JSON.parse(res3.text);

    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersion.id);

    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("import submissions to assignment without .zip submission extensions", async () => {
    const res2 = await createAssignmentRequest(
      server,
      courseId,
      teacherCookie,
      AssignmentType.CODE,
      ".c",
      false
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
    const assignmentVersion = JSON.parse(res3.text);

    const res = await request(server)
      .post("/api/submissions/import")
      .set("cookie", teacherCookie)
      .attach("file", exampleFile, "weblab.zip")
      .field("assignmentVersionId", assignmentVersion.id);

    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);
  });
});
*/
