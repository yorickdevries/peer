import CoursePS from "../../src/prepared_statements/courses_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("CoursePreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
    });

    /**
     * Get all courses
     */
    it("get all courses", async () => {
        expect(await CoursePS.executeGetAllCourses()).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Get cousre by id
     */
    it("get course by id", async () => {
        expect(await CoursePS.executeGetCourseById(1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            "id": 1,
            name: "ED-3"
        }]);
    });

    /**
     * Get assignment by courseid
     */
    it("get assignment by course id", async () => {
        expect(await CoursePS.executeGetAssignmentByCourseId(1)).to.deep.equal([{
            course_id: 1,
            description: "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00"),
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00"),
            title: "Assignment 1"
        }]);
    });


    /**
     * Test create a course
     */
    it("createa a course", async () => {
        expect(await CoursePS.executeCreateCourse("hi", "super leuk")).to.deep.equal([{
            description: "hi",
            id: 2,
            name: "super leuk"
        }]);
    });

    /**
     * Test update a course
     */
    it("update a course", async () => {
        expect(await CoursePS.executeUpdateCourse(1, "hi", "super leuk")).to.deep.equal([{
            description: "hi",
            id: 1,
            name: "super leuk"
        }]);
    });





});