import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import path from "path";
import initializeData from "../../src/util/initializeData";
import fs from "fs";

describe("Assignments", () => {
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

  test("make an assignment", async () => {
    const sessionCookie = await mockLoginCookie(server, "teacher");

    // create a course
    const res1 = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName",
        courseCode: "ABC123",
        enrollable: false,
        faculty: "EEMCS",
        academicYear: "2019/2020",
        description: null,
      })
      .set("cookie", sessionCookie);
    // assertions
    const course = JSON.parse(res1.text);

    // create am assignment course
    const exampleAssignmentFile = path.resolve(
      __dirname,
      "../../exampleData/assignments/assignment1.pdf"
    );
    const res2 = await request(server)
      .post("/api/assignments")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("reviewsPerUser", 2)
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
      .field("reviewEvaluationDueDate", "null")
      .field("description", "Example description")
      .field("externalLink", "null");

    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toMatchObject({
      name: "Example title",
    });
  });
});
