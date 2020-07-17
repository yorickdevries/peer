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
import UserRole from "../../src/enum/UserRole";

describe("Integration", () => {
  // will be initialized and closed in beforeAll / afterAll
  let connection: Connection;
  let server: http.Server;

  beforeAll(async () => {
    clear();
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
    clear();
    //close server and connection
    server.close();
    await connection.close();
  });

  test("Integration test", async () => {
    let res; // will store all responses
    // set the mocktime
    advanceTo(new Date("2020-01-01T10:00Z"));

    // log in as teacher
    const teacherCookie = async () => {
      return await mockLoginCookie(server, "teacher");
    };
    const teacherCookie2 = async () => {
      return await mockLoginCookie(server, "anotherteacher");
    };
    const studentCookie1 = async () => {
      return await mockLoginCookie(server, "student1", "student");
    };
    const studentCookie2 = async () => {
      return await mockLoginCookie(server, "student2", "student");
    };

    // check whether the teacher is logged in
    res = await request(server)
      .get("/api/authenticated")
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toEqual({ authenticated: true });

    // get teacher userinfo
    res = await request(server)
      .get("/api/me")
      .set("cookie", await teacherCookie());
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
      .set("cookie", await teacherCookie());
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
      .set("cookie", await teacherCookie());
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
        facultyName: "EEMCS",
        academicYearName: "2019/2020",
        description: null,
      })
      .set("cookie", await teacherCookie());
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
        facultyName: "EEMCS",
        academicYearName: "2019/2020",
        description: null,
      })
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    // create another course as another teacher
    res = await request(server)
      .post("/api/courses")
      .send({
        name: "AntoherName",
        courseCode: "XYZ123",
        enrollable: false,
        facultyName: "3mE",
        academicYearName: "2019/2020",
        description: null,
      })
      .set("cookie", await teacherCookie2());
    const course2 = JSON.parse(res.text);

    // fetch all the enrolled courses from the server as teacher
    res = await request(server)
      .get("/api/enrollments/enrolled")
      .set("cookie", await teacherCookie());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      { courseId: course.id, role: "teacher" },
    ]);

    // check available courses as teacher
    res = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", await teacherCookie());
    // assertions
    expect(JSON.parse(res.text).length).toEqual(0);

    // get a course by id
    res = await request(server)
      .get(`/api/courses/${course.id}`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(JSON.parse(res.text).name).toBe("CourseName");

    // get enrollment for a course
    res = await request(server)
      .get(`/api/courses/${course.id}/enrollment`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(JSON.parse(res.text)).toMatchObject({
      courseId: course.id,
      role: UserRole.TEACHER,
    });

    // make an assingment for the course
    // create am assignment course
    const exampleAssignmentFile = path.resolve(
      __dirname,
      "../../exampleData/assignments/assignment1.pdf"
    );
    res = await request(server)
      .post("/api/assignments")
      .set("cookie", await teacherCookie())
      .attach("file", fs.readFileSync(exampleAssignmentFile), "assignment1.pdf")
      .field("name", "Example title")
      .field("courseId", course.id)
      .field("reviewsPerUser", 1)
      .field("enrollable", true)
      .field("reviewEvaluation", true)
      .field("publishDate", new Date("2020-01-05T10:00Z").toISOString())
      .field("dueDate", new Date("2020-02-01T10:00Z").toISOString())
      .field("reviewPublishDate", new Date("2020-03-01T10:00Z").toISOString())
      .field("reviewDueDate", new Date("2020-04-01T10:00Z").toISOString())
      .field(
        "reviewEvaluationDueDate",
        new Date("2020-05-01T10:00Z").toISOString()
      )
      .field("description", "Example description")
      .field("externalLink", "null");
    expect(res.status).toBe(HttpStatusCode.OK);
    let assignment = JSON.parse(res.text);
    expect(assignment).toMatchObject({
      name: "Example title",
    });

    // get all assignments of a course by the teacher
    res = await request(server)
      .get(`/api/assignments?courseId=${course.id}`)
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text).length).toBe(1);

    // make a questionnaire
    res = await request(server)
      .post("/api/submissionquestionnaires/")
      .send({
        assignmentId: assignment.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);

    // get the assignment including questionnaire
    res = await request(server)
      .get(`/api/assignments/${assignment.id}`)
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    assignment = JSON.parse(res.text);

    // get the questionnaire
    res = await request(server)
      .get(
        `/api/submissionquestionnaires/${assignment.submissionQuestionnaireId}`
      )
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const submissionQuestionnaire = JSON.parse(res.text);

    // CREATE QUESTIONS
    // post a checkbox question in the questionnaire
    res = await request(server)
      .post(`/api/checkboxquestions/`)
      .send({
        text: "This is a Checkbox question",
        number: 1,
        optional: true,
        questionnaireId: submissionQuestionnaire.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const checkboxQuestion = JSON.parse(res.text);
    expect(checkboxQuestion).toMatchObject({
      text: "This is a Checkbox question",
      number: 1,
      optional: true,
    });

    // post Checkbox question option in the questionnaire
    res = await request(server)
      .post(`/api/checkboxquestionoptions/`)
      .send({
        text: "option 1",
        checkboxQuestionId: checkboxQuestion.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      text: "option 1",
    });

    // post Checkbox question option in the questionnaire
    res = await request(server)
      .post(`/api/checkboxquestionoptions/`)
      .send({
        text: "option 2",
        checkboxQuestionId: checkboxQuestion.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      text: "option 2",
    });

    // post a MC question in the questionnaire
    res = await request(server)
      .post(`/api/multiplechoicequestions/`)
      .send({
        text: "This is a MC question",
        number: 2,
        optional: true,
        questionnaireId: submissionQuestionnaire.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const mcQuestion = JSON.parse(res.text);
    expect(mcQuestion).toMatchObject({
      text: "This is a MC question",
      number: 2,
      optional: true,
    });

    // post a MC question option in the questionnaire
    res = await request(server)
      .post(`/api/multiplechoicequestionoptions/`)
      .send({
        text: "option A",
        multipleChoiceQuestionId: mcQuestion.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      text: "option A",
    });

    // post another MC question option in the questionnaire
    res = await request(server)
      .post(`/api/multiplechoicequestionoptions/`)
      .send({
        text: "option B",
        multipleChoiceQuestionId: mcQuestion.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject({
      text: "option B",
    });

    // post an open question in the questionnaire
    res = await request(server)
      .post(`/api/openquestions/`)
      .send({
        text: "This is an Open question",
        number: 3,
        optional: false,
        questionnaireId: submissionQuestionnaire.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const openQuestion = JSON.parse(res.text);
    expect(openQuestion).toMatchObject({
      text: "This is an Open question",
      number: 3,
      optional: false,
    });

    // post a range question in the questionnaire
    res = await request(server)
      .post(`/api/rangequestions/`)
      .send({
        text: "This is a Range question",
        number: 4,
        optional: true,
        range: 5,
        questionnaireId: submissionQuestionnaire.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const rangeQuestion = JSON.parse(res.text);
    expect(rangeQuestion).toMatchObject({
      text: "This is a Range question",
      number: 4,
      optional: true,
    });

    // post an upload question in the questionnaire
    res = await request(server)
      .post(`/api/uploadquestions/`)
      .send({
        text: "This is an Upload question",
        number: 5,
        optional: true,
        extensions: ".pdf",
        questionnaireId: submissionQuestionnaire.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const uploadQuestion = JSON.parse(res.text);
    expect(uploadQuestion).toMatchObject({
      text: "This is an Upload question",
      number: 5,
      optional: true,
    });

    // make a reviewquestionnaire
    res = await request(server)
      .post("/api/reviewquestionnaires/")
      .send({
        assignmentId: assignment.id,
      })
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);

    // get the assignment including questionnaire
    res = await request(server)
      .get(`/api/assignments/${assignment.id}`)
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    assignment = JSON.parse(res.text);

    // get the questionnaire
    res = await request(server)
      .get(`/api/reviewquestionnaires/${assignment.reviewQuestionnaireId}`)
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);
    const reviewQuestionnaire = JSON.parse(res.text);

    // add default questions to reviewquestionnaire
    res = await request(server)
      .patch(
        `/api/reviewquestionnaires/${reviewQuestionnaire.id}/defaultquestions`
      )
      .set("cookie", await teacherCookie());
    expect(res.status).toBe(HttpStatusCode.OK);

    // set date to the moment that the assignment is published
    advanceTo(new Date("2020-01-15T10:00Z"));

    // check available courses as student
    res = await request(server)
      .get("/api/courses/enrollable")
      .set("cookie", await studentCookie1());
    // assertions
    expect(JSON.parse(res.text).length).toEqual(1);

    // enroll for course as student1
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", await studentCookie1());
    // assertions
    const enrollment1 = JSON.parse(res.text);
    expect(enrollment1).toMatchObject({
      courseId: course.id,
      role: "student",
    });

    // enroll for course as student2
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", await studentCookie2());
    // assertions
    const enrollment2 = JSON.parse(res.text);
    expect(enrollment2).toMatchObject({
      courseId: course.id,
      role: "student",
    });

    // enroll for course as student for the second time
    res = await request(server)
      .post(`/api/courses/${course.id}/enroll`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);

    // enroll for an unenrollable course
    res = await request(server)
      .post(`/api/courses/${course2.id}/enroll`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.BAD_REQUEST);

    // get enrollments
    res = await request(server)
      .get("/api/enrollments/enrolled")
      .set("cookie", await studentCookie1());
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
      .get(`/api/courses/${course.id}/enrolledassignments`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([]);

    // get available assignments
    res = await request(server)
      .get(`/api/courses/${course.id}/enrollableassignments`)
      .set("cookie", await studentCookie1());
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
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    const group1 = JSON.parse(res.text);
    expect(group1).toMatchObject({
      name: "student1",
    });

    // enroll in assignment
    res = await request(server)
      .post(`/api/assignments/${assignment.id}/enroll`)
      .set("cookie", await studentCookie2());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    const group2 = JSON.parse(res.text);
    expect(group2).toMatchObject({
      name: "student2",
    });

    // get enrolled assignments
    res = await request(server)
      .get(`/api/courses/${course.id}/enrolledassignments`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      {
        id: assignment.id,
      },
    ]);

    // get available assignments
    res = await request(server)
      .get(`/api/courses/${course.id}/enrollableassignments`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).not.toMatchObject([
      {
        id: assignment.id,
      },
    ]);

    // get group
    res = await request(server)
      .get(`/api/assignments/${assignment.id}/group`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(group1);

    // get all groups by the teacher
    res = await request(server)
      .get(`/api/groups?assignmentId=${assignment.id}`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([group1, group2]);

    // get 1 group by the teacher
    res = await request(server)
      .get(`/api/groups/${group1.id}`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(group1);

    // get course students by the teacher
    res = await request(server)
      .get(`/api/enrollments/?courseId=${course.id}&role=student`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      { userNetid: "student1" },
      { userNetid: "student2" },
    ]);

    // get all groups by the student
    res = await request(server)
      .get(`/api/groups?assignmentId=${assignment.id}`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.FORBIDDEN);

    // make a submission for student 1
    const exampleSubmissionFile1 = path.resolve(
      __dirname,
      "../../exampleData/submissions/submission1.pdf"
    );
    res = await request(server)
      .post("/api/submissions")
      .set("cookie", await studentCookie1())
      .attach(
        "file",
        fs.readFileSync(exampleSubmissionFile1),
        "submission1.pdf"
      )
      .field("groupId", group1.id)
      .field("assignmentId", assignment.id);

    expect(res.status).toBe(HttpStatusCode.OK);
    const submission1 = JSON.parse(res.text);

    // make a submission for student 2
    const exampleSubmissionFile2 = path.resolve(
      __dirname,
      "../../exampleData/submissions/submission2.pdf"
    );
    res = await request(server)
      .post("/api/submissions")
      .set("cookie", await studentCookie2())
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
      .get(`/api/assignments/${assignment.id}/submissions?groupId=${group1.id}`)
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([submission1]);

    // get latest submissions for this assignment by this group
    res = await request(server)
      .get(
        `/api/assignments/${assignment.id}/latestsubmission?groupId=${group1.id}`
      )
      .set("cookie", await studentCookie1());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject(submission1);

    // get all submissions for this assignment as teacher
    res = await request(server)
      .get(`/api/submissions?assignmentId=${assignment.id}`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([submission1, submission2]);

    // get latest submissions for this assignment as teacher
    res = await request(server)
      .get(`/api/submissions/latest?assignmentId=${assignment.id}`)
      .set("cookie", await teacherCookie());
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([submission1, submission2]);
  });
});
