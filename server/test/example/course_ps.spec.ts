import CoursePS from "../../src/prepared_statements/courses_ps";
import { expect } from "chai";
import "mocha";

describe("CoursePreparedStatement Test", () => {

    /**
     * Get all courses
     */
    it("get all courses", async () => {
        expect(await CoursePS.executeGetAllCourses()).to.deep.equal([{
            description: 'This is a beautiful course description!',
            id: 1,
            name: 'ED-3'
        }]);
    });

    /**
     * Get cousre by id
     */
    it("get course by id", async () => {
        expect(await CoursePS.executeGetCourseById(1)).to.deep.equal([{
            description: 'This is a beautiful course description!',
            id: 1,
            name: 'ED-3'
        }]);
    });

    /**
     * Get assignment by courseid
     */
    it("get assignment by course id", async () => {
        expect(await CoursePS.executeGetAssignmentByCourseId(1)).to.deep.equal([{
            course_id: 1,
            description: "Description",
            id: 2,
            title: "New"
        }, {
            course_id: 1,
            description: "updated",
            id: 1,
            title: "Updated"
        }]);
    });


    /**
     * Test create a course
     */
    it("createa a course", async () => {
        expect(await CoursePS.executeCreateCourse('hi', 'super leuk')).to.deep.equal([{
            description: 'hi',
            id: 2,
            name: 'super leuk'
        }]);
    });

    /**
     * Test update a course
     */
    it("update a course", async () => {
        expect(await CoursePS.executeUpdateCourse(1, 'hi', 'super leuk')).to.deep.equal([{
            description: 'hi',
            id: 1,
            name: 'super leuk'
        }]);
    });





});