import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import CoursePS from "../../src/prepared_statements/courses_ps";
import { Roles } from "../../src/roles";

describe("CoursePreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Get all courses
     */
    it("get all courses", async () => {
        expect(await CoursePS.executeGetAllCourses()).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        },
            {
                "description": "Test-course",
                "id": 2,
                "name": "ED-4"
            }
        ]);
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
            id: 3,
            name: "super leuk"
        });
    });

    /**
     * Get assignment by courseid
     */
    it("get assignment by course id", async () => {
        expect(await CoursePS.executeGetAssignmentsByCourseId(1)).to.deep.equal([{
            "course_id": 1,
            "description": "Example assignment number one",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment1.pdf",
            "id": 1,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("2018-05-01T20:30:00Z"),
            "review_publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 1",
            "reviews_per_user": 2
        },
        {
            "course_id": 1,
            "description": "Example assignment number two",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment2.pdf",
            "id": 2,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("2018-05-01T20:30:00Z"),
            "review_publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 2",
            "reviews_per_user": 1
        },
        {
            "course_id": 1,
            "description": "Example assignment number three",
            "due_date": new Date("2018-05-01T20:30:00Z"),
            "filename": "assignment3.pdf",
            "id": 3,
            "publish_date": new Date("2018-04-01T20:30:00Z"),
            "review_due_date": new Date("2018-05-01T20:30:00Z"),
            "review_publish_date": new Date("2018-04-01T20:30:00Z"),
            "title": "Assignment 3",
            "reviews_per_user": 1
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
        }]).to.deep.equal(await CoursePS.executeGetAllEnrolledCourses("paulvanderlaan"));
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

});