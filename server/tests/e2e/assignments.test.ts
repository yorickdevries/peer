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
import AssignmentType from "../../src/enum/AssignmentType";
import Course from "../../src/models/Course";
import publishAssignment from "../../src/assignmentProgression/publishAssignment";

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
    const res2 = await request(server)
      .post("/api/assignments")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
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

    expect(res2.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res2.text)).toMatchObject({
      name: "Example title",
    });
  });

  test("make an assignment with invalid assignment type", async () => {
    const res2 = await request(server)
      .post("/api/assignments")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
      .field("reviewEvaluationDueDate", "null")
      .field("description", "Example description")
      .field("externalLink", "null")
      .field("submissionExtensions", ".pdf")
      .field("blockFeedback", true)
      .field("lateSubmissions", true)
      .field("lateSubmissionReviews", true)
      .field("lateReviewEvaluations", "null")
      .field("automaticStateProgression", false)
      .field("assignmentType", "invalid");

    expect(res2.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test("invalid patch assignment with changed type", async () => {
    const res2 = await request(server)
      .post("/api/assignments")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
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

    const res4 = await request(server)
      .patch(`/api/assignments/${assignment.id}`)
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
      .field("reviewEvaluationDueDate", "null")
      .field("description", "Example description")
      .field("externalLink", "null")
      .field("submissionExtensions", ".pdf")
      .field("blockFeedback", true)
      .field("lateSubmissions", true)
      .field("lateSubmissionReviews", true)
      .field("lateReviewEvaluations", "null")
      .field("automaticStateProgression", false)
      .field("assignmentType", AssignmentType.CODE);

    expect(res4.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("valid patch assignment with changed type", async () => {
    const res2 = await request(server)
      .post("/api/assignments")
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
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

    const res4 = await request(server)
      .patch(`/api/assignments/${assignment.id}`)
      .set("cookie", sessionCookie)
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("enrollable", false)
      .field("reviewEvaluation", false)
      .field("publishDate", new Date("2020-06-23T10:00Z").toISOString())
      .field("dueDate", new Date("2020-06-24T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-06-25T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-06-26T10:00Z").toISOString())
      .field("reviewEvaluationDueDate", "null")
      .field("description", "Example description")
      .field("externalLink", "null")
      .field("submissionExtensions", ".pdf")
      .field("blockFeedback", true)
      .field("lateSubmissions", true)
      .field("lateSubmissionReviews", true)
      .field("lateReviewEvaluations", "null")
      .field("automaticStateProgression", false)
      .field("assignmentType", AssignmentType.CODE);

    expect(res4.status).toBe(HttpStatusCode.OK);
  });
});
