import CoursePS from "../../src/prepared_statements/courses_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-TestDataBase.sql");

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
        expect(await CoursePS.executeGetCourseById(1)).to.deep.equal({
            description: "This is a beautiful course description!",
            "id": 1,
            name: "ED-3"
        });
    });

    /**
     * Test create a course
     */
    it("createa a course", async () => {
        expect(await CoursePS.executeCreateCourse("hi", "super leuk")).to.deep.equal({
            description: "hi",
            id: 2,
            name: "super leuk"
        });
    });

    /**
     * Get assignment by courseid
     */
    it("get assignment by course id", async () => {
        expect(await CoursePS.executeGetAssignmentsByCourseId(1)).to.deep.equal([{
            course_id: 1,
            description: "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            filename: "assignment/test_file.pdf",
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            title: "Assignment 1"
        }]);
    });


        /**
     * Test update a course
     */
    it("update a course", async () => {
        expect(await CoursePS.executeUpdateCourse(1, "hi", "super leuk")).to.deep.equal({
            description: "hi",
            id: 1,
            name: "super leuk"
        });
    });

    /**
     * Test get enrolled courses.
     */
    it("get all enrolled courses", async () => {
        expect([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]).to.deep.equal(await CoursePS.executeGetAllEnrolledCourses('paulvanderlaan'));
    });

    /**
     * Test get course role of user.
     */
    it("get course role of user", async () => {
        expect({
            role: "Owner"
        }).to.deep.equal(await CoursePS.executeGetRoleById('paulvanderlaan', 1));
    });



});