import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import AssignmentExport from "../../src/models/AssignmentExport";
import Submission from "../../src/models/Submission";
import { mock, instance } from "ts-mockito";
import exportToZip from "../../src/util/exportZip";
import path from "path";
import File from "../../src/models/File";
import fs from "fs";
import JSZip from "jszip";

describe("Courses", () => {
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

  test("Create a course", async () => {
    const sessionCookie = await mockLoginCookie(server, "teacher");
    const res = await request(server)
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
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      name: "CourseName",
      courseCode: "ABC123",
      enrollable: false,
      description: null,
    });
  });

  test("Check enrollable courses", async () => {
    const teacherCookie = await mockLoginCookie(server, "teacher");

    // create a normal course
    const res1 = await request(server)
      .post("/api/courses")
      .send({
        name: "CourseName1",
        courseCode: "ABC123",
        enrollable: true,
        facultyId: 1,
        academicYearId: 3,
        description: null,
      })
      .set("cookie", teacherCookie);
    const course1 = JSON.parse(res1.text);

    // create a course in an inactive year
    const res2 = await request(server)
      .post("/api/courses")
      .send({
        name: "oldName",
        courseCode: "ABC123",
        enrollable: true,
        facultyId: 1,
        academicYearId: 3,
        description: null,
      })
      .set("cookie", teacherCookie);
    const course2 = JSON.parse(res2.text);

    // create a non-enrollable course
    const res3 = await request(server)
      .post("/api/courses")
      .send({
        name: "nonEnrollableCourse",
        courseCode: "ABC123",
        enrollable: false,
        facultyId: 1,
        academicYearId: 3,
        description: null,
      })
      .set("cookie", teacherCookie);
    const course3 = JSON.parse(res3.text);

    // log in as student
    const studentCookie = await mockLoginCookie(server, "student");
    // check available courses as student
    const res4 = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", studentCookie);
    // assertions
    const courses = JSON.parse(res4.text);
    expect(courses).toMatchObject([course1, course2]);
    expect(courses).not.toMatchObject([course3]);
  });
  test("Single submission", async () => {
    let mockedAssignmentExport: AssignmentExport;
    let instanceOfAssignmentExport: AssignmentExport;
    let s1: Submission;
    let s2: Submission;
    let instanceOfS1: Submission;
    let instanceOfS2: Submission;
    let listOfSubmissions: Submission[];
  //let filePath:string = path.join(__dirname, "../testFiles", "submission1.pdf");
  const zipFileName = "zippedSubmissions";
    const pdfFile = new File(
      "submission",
      ".pdf",
      null,
      path.join(__dirname, "../testFiles", "submission1.pdf")
    );
    mockedAssignmentExport = mock(AssignmentExport);
    instanceOfAssignmentExport = instance(mockedAssignmentExport);
    s1 = mock(Submission);
    s2 = mock(Submission);
    instanceOfS2 = instance(s2);
    instanceOfS1 = instance(s1);
    instanceOfS2.userNetid = "user2";
    instanceOfS1.userNetid = "user1";
    instanceOfS2.file = pdfFile;
    instanceOfS1.file = pdfFile;
    listOfSubmissions = [instanceOfS1, instanceOfS2];
    await exportToZip(
      instanceOfAssignmentExport,
      listOfSubmissions,
      zipFileName
    );

    const zipFilePath = "zippedSubmissions.zip";
    let files: any[] = [];
    // read a zip file
    await fs.readFile(zipFilePath, (err: any, data: any) => {
      if (err) throw err;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      JSZip.loadAsync(data).then((zip: any) => {
        files = Object.keys(zip.files);
        expect(files).toBe(["pdfs/", "pdfs/user1.pdf", "pdfs/user2.pdf"]);
      });
    });
  });

});
