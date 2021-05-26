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
import AssignmentVersion from "../../src/models/AssignmentVersion";
import publishAssignment from "../../src/assignmentProgression/publishAssignment";
import closeSubmission from "../../src/assignmentProgression/closeSubmission";
import {distributeReviewsForAssignment} from "../../src/assignmentProgression/distributeReviews";
import Group from "../../src/models/Group";
import fs from "fs";
import path from "path";

describe("CodeAnnotations", () => {
  let connection: Connection;
  let server: http.Server;
  let teacherCookie: string;
  let sessionCookie1: string;
  let sessionCookie2: string;
  let assignmentVersion: AssignmentVersion;
  let group1: Group;
  let group2: Group;
  let reviewId1: number;
  //let reviewId2: number;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  beforeEach(async () => {
    teacherCookie = await mockLoginCookie(server, "teacher");
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
    assignmentVersion = JSON.parse(res3.text);

    const res11 = await request(server)
      .patch(`/api/assignmentversions/${assignmentVersion.id}`)
      .send({
        name: "default",
        assignmentVersionsToReview: [assignmentVersion.id],
        reviewsPerUserPerAssignmentVersionToReview: 1,
        selfReview: false,
      })
      .set("cookie", teacherCookie);
    assignmentVersion = JSON.parse(res11.text);

    // publish assignment
    await publishAssignment(assignment.id);
    // enroll first student in course
    await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", sessionCookie1);

    // enroll first student in assignment
    const res4 = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", sessionCookie1);
    group1 = JSON.parse(res4.text);

    // enroll second student in course
    await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", sessionCookie2);

    // enroll second student in assignment
    const res5 = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", sessionCookie2);
    group2 = JSON.parse(res5.text);

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
    const res10 = await request(server)
      .post("/api/submissionquestionnaires")
      .set("cookie", teacherCookie)
      .send({ assignmentVersionId: assignmentVersion.id});
    let questionnaire = JSON.parse(res10.text)
    console.log(questionnaire.assignmentVersion)

    // Create question for questionnaire
    await request(server)
      .post("/api/openquestions")
      .set("cookie", teacherCookie)
      .send({
        text: "Open question",
        number: 1,
        optional: "true",
        questionnaireId: questionnaire.id,
      });
    
    const res13 = await request(server)
      .get(`/api/submissionquestionnaires/${questionnaire.id}`)
      .set("cookie", teacherCookie)
    console.log(res13.text)
    questionnaire = JSON.parse(res13.text);
    console.log(questionnaire.assignmentVersion)

    const res12 = await request(server)
      .get(`/api/assignmentversions/${assignmentVersion.id}`)
      .set("cookie", teacherCookie);
    console.log(assignmentVersion)
    assignmentVersion = JSON.parse(res12.text);
    console.log(assignmentVersion.submissionQuestionnaireId)

    // distribute the revies for this assignment
    await distributeReviewsForAssignment(assignment.id);
    
    const res6 = await request(server)
      .get(`/api/submissionquestionaires/${assignmentVersion.submissionQuestionnaireId}/reviews`)
      .set("cookie", sessionCookie1);
    console.log(res6.text);
    //reviewId1 = JSON.parse(res6.text);

    /*await request(server)
      .get(`/api/submissionquestionaires/${questionnaire.id}/reviews`)
      .set("cookie", sessionCookie2);*/
    //reviewId2 = JSON.parse(res7.text);
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("get maximum comment length", async () => {
    const res = await request(server)
      .get("/api/codeannotations/getMaxCommentLength")
      .set("cookie", sessionCookie1);

    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text) === 255);
    console.log(reviewId1);
  });

  /*test("create new annotation", async () => {
    const body = {
      reviewId: reviewId1,
      commentText: "Some text",
      startLineNumber: 10,
      endLineNumber: 11,
      selectedFile: "submission1.c"
    }
    const res = await request(server)
      .post("/api/codeannotations")
      .set("cookie", sessionCookie1)
      .send(body);

    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(body);
  });*/

});
