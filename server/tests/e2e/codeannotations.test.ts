import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import createAssignmentRequest from "../helpers/createAssignmentRequest";
import AssignmentType from "../../src/enum/AssignmentType";
import publishAssignment from "../../src/assignmentProgression/publishAssignment";
import closeSubmission from "../../src/assignmentProgression/closeSubmission";
import fs from "fs";
import path from "path";

describe("CodeAnnotations", () => {
  let connection: Connection;
  let server: http.Server;
  let sessionCookie1: string;
  let sessionCookie2: string;
  let reviewId1: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  let body: Object;
  // Possibility for testing with a second enrolled student
  //let reviewId2: number;
  const maxAnnotationLength = 65535;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  beforeEach(async () => {
    // create different cookies for different users
    const teacherCookie = await mockLoginCookie(server, "teacher");
    sessionCookie1 = await mockLoginCookie(server, "student1", "student");
    sessionCookie2 = await mockLoginCookie(server, "student2", "student");

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
    let assignmentVersion = JSON.parse(res3.text);

    // Patch assignmentVersion with assignmentVersions to review
    const res4 = await request(server)
      .patch(`/api/assignmentversions/${assignmentVersion.id}`)
      .send({
        name: "default",
        assignmentVersionsToReview: [assignmentVersion.id],
        reviewsPerUserPerAssignmentVersionToReview: 1,
        selfReview: false,
      })
      .set("cookie", teacherCookie);
    assignmentVersion = JSON.parse(res4.text);

    // publish assignment
    await publishAssignment(assignment.id);
    // enroll first student in course
    await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", sessionCookie1);

    // enroll first student in assignment
    const res5 = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", sessionCookie1);
    const group1 = JSON.parse(res5.text);

    // enroll second student in course
    await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", sessionCookie2);

    // enroll second student in assignment
    const res6 = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", sessionCookie2);
    const group2 = JSON.parse(res6.text);

    // Hand in example file for student 1
    const exampleSubmissionFile = path.resolve(
      __dirname,
      "../../exampleData/submissions/submission1.c"
    );
    await request(server)
      .post("/api/submissions")
      .set("cookie", sessionCookie1)
      .attach("file", fs.readFileSync(exampleSubmissionFile), "submission1.c")
      .field("groupId", group1.id)
      .field("assignmentVersionId", assignmentVersion.id);

    // Hand in example file for student 2
    await request(server)
      .post("/api/submissions")
      .set("cookie", sessionCookie2)
      .attach("file", fs.readFileSync(exampleSubmissionFile), "submission1.c")
      .field("groupId", group2.id)
      .field("assignmentVersionId", assignmentVersion.id);

    // close the submission stage
    await closeSubmission(assignment.id);

    // Create questionnaire for the assignment
    const res7 = await request(server)
      .post("/api/submissionquestionnaires")
      .set("cookie", teacherCookie)
      .send({ assignmentVersionId: assignmentVersion.id });
    let questionnaire = JSON.parse(res7.text);

    // Create question for questionnaire
    await request(server)
      .post("/api/openquestions")
      .set("cookie", teacherCookie)
      .send({
        text: "Open question",
        number: 1,
        optional: "true",
        questionnaireId: questionnaire.id,
        maxWordCount: 100,
        minWordCount: 1,
      });

    // Update the questionnaire with the open question
    const res8 = await request(server)
      .get(`/api/submissionquestionnaires/${questionnaire.id}`)
      .set("cookie", teacherCookie);
    questionnaire = JSON.parse(res8.text);

    // Update the assignmentVersion with the questionnaire
    const res9 = await request(server)
      .get(`/api/assignmentversions/${assignmentVersion.id}`)
      .set("cookie", teacherCookie);
    assignmentVersion = JSON.parse(res9.text);

    // distribute the revies for this assignment
    await request(server)
      .post(`/api/reviewofsubmissions/distribute?assignmentId=${assignment.id}`)
      .set("cookie", teacherCookie);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the reviewid for the first student
    const res10 = await request(server)
      .get(
        `/api/submissionquestionnaires/${assignmentVersion.submissionQuestionnaireId}/reviews`
      )
      .set("cookie", sessionCookie1);
    reviewId1 = JSON.parse(res10.text)[0].id;

    // Create default annotation body
    body = {
      reviewId: reviewId1,
      annotationText: "Some text",
      startLineNumber: 10,
      endLineNumber: 11,
      selectedFile: "submission1.c",
    };

    /* Posibility for second enrolled student
    const res11 = await request(server)
      .get(`/api/submissionquestionaires/${questionnaire.id}/reviews`)
      .set("cookie", sessionCookie2);
    reviewId2 = JSON.parse(res11.text);*/
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("get maximum annotation length", async () => {
    //Get the maximum annotation length
    const res = await request(server)
      .get("/api/codeannotations/getmaxannotationlength")
      .set("cookie", sessionCookie1);

    // Check if the response is correct
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text) === maxAnnotationLength);
  });

  test("create new annotation", async () => {
    // Send annotation to the server
    const res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send(body);

    // Check if response is what expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(body);
  });

  test("create and edit annotation", async () => {
    // Send annotation to the server
    let res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send(body);

    // Check if the response equals what is expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(body);

    // Save the annotation id
    const annotationId = JSON.parse(res.text).id;

    // Send a request to update the annotation to the server
    res = await request(server)
      .patch(`/api/codeannotations/${annotationId}`)
      .set("cookie", sessionCookie1)
      .send({ annotationText: "Updated text" });

    // Check if the response equals what is expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      reviewId: reviewId1,
      annotationText: "Updated text",
      startLineNumber: 10,
      endLineNumber: 11,
      selectedFile: "submission1.c",
      id: annotationId,
    });
  });

  test("create and delete annotation", async () => {
    // Send the annotation to the server
    let res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send(body);

    // Check if the response equals what was expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(body);

    // save the annotation id
    const annotationId = JSON.parse(res.text).id;

    // Send a deletion request to the server
    res = await request(server)
      .delete(`/api/codeannotations/${annotationId}`)
      .set("cookie", sessionCookie1);

    // Check if the response equals what is expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      reviewId: reviewId1,
      annotationText: "Some text",
      startLineNumber: 10,
      endLineNumber: 11,
      selectedFile: "submission1.c",
    });
  });

  test("Delete non-existent annotation", async () => {
    // Send a request to delete annotation with id -1, which cannot exist
    const res = await request(server)
      .delete(`/api/codeannotations/-1`)
      .set("cookie", sessionCookie1);

    // Check if response equals what is expected
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);
    expect(res.text).toMatch("Annotation with id -1 does not exist");
  });

  test("Get annotations test", async () => {
    // get the annotations that are currently stored on the server
    let res = await request(server)
      .get(`/api/codeannotations?reviewId=${reviewId1}`)
      .set("cookie", sessionCookie1);

    // Check if the response is what is expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toEqual([]);

    // Send annotation to the server
    res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send(body);

    // Get annotations from review with id == reviewId1 from the server
    res = await request(server)
      .get(`/api/codeannotations?reviewId=${reviewId1}`)
      .set("cookie", sessionCookie1)
      .send({ reviewId: reviewId1 });

    // Check if the response equals what is expected
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([body]);
  });

  test("wrong user, forbidden access", async () => {
    // Send default annotation to the server
    let res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send(body);

    // Check if response is ok and save annotation id
    expect(res.status).toBe(HttpStatusCode.OK);
    const annotationId = JSON.parse(res.text).id;

    // Try to update annotation as a different user
    res = await request(server)
      .patch(`/api/codeannotations/${annotationId}`)
      .set("cookie", sessionCookie2)
      .send({ annotationText: "updated text" });

    // Check if response equals what is expected
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    // Try to delete the annotation as a different user
    res = await request(server)
      .delete(`/api/codeannotations/${annotationId}`)
      .set("cookie", sessionCookie2);

    // Check if response equals what is expected
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);
  });

  test("Try too long annotation", async () => {
    // Send default annotation to the server
    let res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send({
        reviewId: reviewId1,
        annotationText: "A".repeat(maxAnnotationLength + 1),
        startLineNumber: 10,
        endLineNumber: 11,
        selectedFile: "submission1.c",
      });

    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);

    res = await request(server)
      .get(`/api/codeannotations?reviewId=${reviewId1}`)
      .set("cookie", sessionCookie1);

    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toEqual([]);

    res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send({
        reviewId: reviewId1,
        annotationText: "A".repeat(maxAnnotationLength),
        startLineNumber: 10,
        endLineNumber: 11,
        selectedFile: "submission1.c",
      });

    expect(res.status).toBe(HttpStatusCode.OK);

    res = await request(server)
      .get(`/api/codeannotations?reviewId=${reviewId1}`)
      .set("cookie", sessionCookie1);

    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      {
        reviewId: reviewId1,
        annotationText: "A".repeat(maxAnnotationLength),
        startLineNumber: 10,
        endLineNumber: 11,
        selectedFile: "submission1.c",
      },
    ]);
  });
});
