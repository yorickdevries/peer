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
     * Test create a course
     */
    it("createa a course", async () => {
        expect(await CoursePS.executeCreateCourse('hi', 'super leuk')).to.deep.equal([{
            description: 'hi',
            id: 2,
            name: 'super leuk'
        }]);
    });



});