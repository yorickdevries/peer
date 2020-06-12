import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import CoursePS from "../../src/old_api/prepared_statements/courses_ps";
import { Roles } from "../../src/old_api/roles";

describe("CoursePreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Get course by id
     */
    it("get course by id", async () => {
        expect(await CoursePS.executeGetCourseById(1)).to.deep.include({
            description: "This is a beautiful course description!",
            name: "ED-3",
            enrollable: true
        });
    });

    /**
     * Test create a course
     */
    it("create a course", async () => {
        expect(await CoursePS.executeCreateCourse("EWI", "2019/2020", "12",  "hi", "super leuk", true)).to.deep.include({
            description: "hi",
            name: "super leuk",
            enrollable: true
        });
    });

    /**
     * Test update a course
     */
    it("update a course", async () => {
        expect(
            await CoursePS.executeUpdateCourse(1, "EWI", "2019/2020", "12", "hi", "super leuk", false)
        ).to.deep.include({
            description: "hi",
            name: "super leuk",
            enrollable: false
        });
    });

    /**
     * Test get enrolled courses.
     */
    it("get all enrolled courses", async () => {
        const courses: any = await CoursePS.executeGetAllEnrolledCourses("paulvanderlaan");
        expect(courses.length).to.equal(1);
        expect(courses[0]).to.include({
            faculty: "EWI",
            academic_year: "2019/2020",
            course_code: "ED1-1631",
            description: "This is a beautiful course description!",
            name: "ED-3",
            enrollable: true
        });
    });

    /**
     * Test get course role of user.
     */
    it("get course role of user", async () => {
        expect({
            role: "student"
        }).to.deep.equal(await CoursePS.executeGetRoleById("paulvanderlaan", 1));
    });

    /**
     * Test whether the right feedback is sent back when a user is enrolled
     */
    it("Enroll user to course", async () => {
        expect(await CoursePS.executeEnrollInCourseId(1, "yorickdevries", "student")).to.deep.equal({
            course_id: 1,
            role: "student",
            user_netid: "yorickdevries"
        });
    });

    /**
     * Test whether a student can be enrolled
     */
    it("Enroll user to course", async () => {
        // Verify that the student is not yet enrolled
        expect(await CoursePS.executeExistsEnrolledByCourseIdUserById(1, "yorickdevries")).to.deep.equal({
            exists: false
        });
        // enroll in course
        await CoursePS.executeEnrollInCourseId(1, "yorickdevries", "student");
        // Verify that the student is enroleld now
        expect(await CoursePS.executeExistsEnrolledByCourseIdUserById(1, "yorickdevries")).to.deep.equal({
            exists: true
        });
    });

    /**
     * Test whether a student can be enrolled
     */
    it("Set role to teacher", async () => {
        // Verify that the student has student as role
        expect(await CoursePS.executeGetRoleById("paulvanderlaan", 1)).to.deep.equal({
            role: Roles.student
        });

        // Set the role to teacher
        await CoursePS.executeSetRole(1, "paulvanderlaan", Roles.teacher);

        // Verify that the student is enroleld now
        expect(await CoursePS.executeGetRoleById("paulvanderlaan", 1)).to.deep.equal({
            role: Roles.teacher
        });
    });

    /**
     * Test get users by students.
     */
    it("Get all students of a course", async () => {
        // Verify that the student has student as role
        expect(await CoursePS.executeGetUsersByRole(1, Roles.student)).to.deep.equal([{
            user_netid: "paulvanderlaan"
        }]);
    });

    /**
     * Test get users by teachers.
     */
    it("Get all teachers of a course", async () => {
        // Verify that the student has student as role
        const resultWith: any = await CoursePS.executeGetUsersByRoleExcludeTeacher(1, "");
        const resultWithout: any = await CoursePS.executeGetUsersByRoleExcludeTeacher(1, "bplanje");
        expect(resultWith[0].user_netid).to.equal("bplanje");
        expect(resultWithout.user_netid).to.equal(undefined);
    });

    /**
     * Test get all unenrolled courses for a user.
     */
    it("Get all students of a course", async () => {
        // Verify that the student has student as role
        const result: any = await CoursePS.executeGetUnenrolledForUser("paulvanderlaan");
        expect(result[0].id).to.equal(2);
    });

    /**
     * Test get all academic years.
     */
    it("Get all academic years", async () => {
        const years: any = await CoursePS.executeGetAcademicYears();

        expect(years.length > 0).to.be.true;
    });

    /**
     * Test get all faculties.
     */
    it("Get all faculties", async () => {
        const faculties: any = await CoursePS.executeGetFaculties();

        expect(faculties.length > 0).to.be.true;
    });
});