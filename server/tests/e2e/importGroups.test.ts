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
import { advanceTo, clear } from "jest-date-mock";
import AssignmentType from "../../src/enum/AssignmentType";

describe("Group import", () => {
  // will be initialized and closed in beforeAll / afterAll
  let connection: Connection;
  let server: http.Server;
  let teacherCookie: string;
  let courseId: number;
  let assignmentId: number;

  beforeEach(async () => {
    // For the in memory test database, the schema is automatically dropped upon connect
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
    teacherCookie = await mockLoginCookie(server, "teacher");

    // create course
    const res = await request(server)
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
    courseId = JSON.parse(res.text).id;

    // create an assignment
    const res2 = await request(server)
      .post("/api/assignments")
      .set("cookie", teacherCookie)
      .field("name", "Example title")
      .field("courseId", courseId)
      .field("enrollable", true)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-01-01T10:00Z").toISOString())
      .field("dueDate", new Date("2020-02-01T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-03-01T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-04-01T10:00Z").toISOString())
      .field("reviewEvaluationDueDate", "null")
      .field("description", "Example description")
      .field("externalLink", "null")
      .field("submissionExtensions", ".pdf")
      .field("blockFeedback", true)
      .field("lateSubmissions", true)
      .field("lateSubmissionReviews", true)
      .field("lateReviewEvaluations", "null")
      .field("automaticStateProgression", false)
      .field("assignmentType", AssignmentType.DOCUMENT);
    assignmentId = JSON.parse(res2.text).id;

    // set date to the moment that the assignment is published
    advanceTo(new Date("2020-01-15T10:00Z"));
  });

  afterEach(async () => {
    clear();
    //close server and connection
    server.close();
    await connection.close();
  });

  //good weather test
  test("normal import", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.OK);
    // timeout needs te be set as group import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // get all groups by the teacher
    const res2 = await request(server)
      .get(`/api/groups?assignmentId=${assignmentId}`)
      .set("cookie", teacherCookie);
    // assertions
    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "ED 4" }),
        expect.objectContaining({ name: "ED 3" }),
      ])
    );
  });

  test("import with big file", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_big.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    // timeout needs te be set as group import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  test("import with file without groupcolumn", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_no_groupcolumn.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("import with file without usercolumn", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_no_usercolumn.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("import with textfile", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "text_file.txt"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.txt")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("normal import with groupnumbers", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_groupnumbers.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.OK);
    // timeout needs te be set as group import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // get all groups by the teacher
    const res2 = await request(server)
      .get(`/api/groups?assignmentId=${assignmentId}`)
      .set("cookie", teacherCookie);
    // assertions
    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "4" }),
        expect.objectContaining({ name: "ED 3" }),
      ])
    );
  });

  //bad weather tests
  test("No comma separated file is used", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_non_csv.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("student has no group field", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_missing_group.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(res.text).toMatch("does not have a group");
  });

  test("students misses a username", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_missing_username.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("student has no username field", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_empty_username.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("student is not defined, but group is 1", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_empty_groups.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.OK);
    // timeout needs te be set as group import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // get all groups by the teacher
    const res2 = await request(server)
      .get(`/api/groups?assignmentId=${assignmentId}`)
      .set("cookie", teacherCookie);
    // assertions
    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "ED 4" }),
        expect.objectContaining({ name: "ED 3" }),
      ])
    );
  });

  test("student is not defined, but group is 2", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "tud-sndbx-stefanhugtenbu+o.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.OK);
    // timeout needs te be set as group import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  test("some netids are without @ symbol", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export_usernames_without_at.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.OK);
    // timeout needs te be set as group import is asynchronous
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // get all groups by the teacher
    const res2 = await request(server)
      .get(`/api/groups?assignmentId=${assignmentId}`)
      .set("cookie", teacherCookie);
    // assertions
    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "ED 4" }),
        expect.objectContaining({ name: "ED 3" }),
      ])
    );
  });

  test("invalid assignment id", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "example_export.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", -1);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("duplicate student", async () => {
    // group export
    const groupCSV = path.resolve(
      __dirname,
      "../../exampleData/groupExports/",
      "duplicate_student.csv"
    );
    const res = await request(server)
      .post("/api/groups/import")
      .set("cookie", teacherCookie)
      .attach("file", fs.readFileSync(groupCSV), "file.csv")
      .field("assignmentId", assignmentId);
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(res.text).toMatch("Duplicate netid");
  });
});
