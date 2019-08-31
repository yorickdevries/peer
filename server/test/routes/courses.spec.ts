import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/courses").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

import { Roles } from "../../src/roles";

describe("API Course routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        MockLogin.initialize("bplanje", undefined, "employee");
        await TestData.initializeDatabase();
    });

    /**
     * Tests whether courses are posted and returned
     */
    it("Put courses/", async () => {
        const updateData = {
            academic_year: "2018/2019",
            course_code: "2",
            description: "example",
            enrollable: true,
            faculty: "3ME",
            name: "test name"
        };

        const res = await chai.request(router)
            .post("/")
            .send(updateData);

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({ description: "example", name: "test name", enrollable: true });

        const result = await chai.request(router).get("/enrolled");
        const newCourse = result.body.find((object: any) => object.id == 4);

        expect(result.status).to.equal(200);
        expect(newCourse).to.deep.include(updateData);
    });

    /**
     * Tests whether course can be made when the affiliation is ["employee","faculty"]
     */
    it("create course as [employee,faculty]", async () => {
        MockLogin.initialize("bplanje", undefined, ["employee", "faculty"]);
        const res = await chai.request(router)
            .post("/")
            .send({
                faculty: "3ME",
                academic_year: "2018/2019",
                course_code: "2",
                description: "example",
                name: "test name",
                enrollable: true
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({
                faculty: "3ME",
                academic_year: "2018/2019",
                course_code: "2",
                description: "example",
                name: "test name",
                enrollable: true
            }
        );
    });

    /**
     * Tests whether course cannot be made when the affiliation is student
     */
    it("Create course as student", async () => {
        MockLogin.initialize("bplanje", undefined, "student");
        const res = await chai.request(router)
            .post("/")
            .send({
                faculty: "3ME", academic_year: "2018/2019", course_code: "2", description: "example", name: "test name"
            });

        expect(res.status).to.equal(401);
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get courses/enrolled", async () => {
        // test the router
        const res = await chai.request(router).get("/enrolled");
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(3);
        expect(res.body[0]).to.deep.include({
            faculty: "EWI",
            academic_year: "2019/2020",
            course_code: "ED1-1631",
            description: "This is a beautiful course description!",
            name: "ED-3",
            enrollable: true
        });

        expect(res.body[1]).to.deep.include({
            faculty: "EWI",
            academic_year: "2019/2020",
            course_code: "ED2-1138",
            description: "Test-course",
            name: "ED-4",
            enrollable: true
        });

        expect(res.body[2]).to.deep.include({
            faculty: "EWI",
            academic_year: "2019/2020",
            course_code: "ED3-1336",
            description: "Test-course2",
            name: "ED-5",
            enrollable: false
        });
    });

    /**
     * Test whether all assignments for a specific course are fetched.
     */
    it("Get /:courseId/assignments", async () => {
        // test the router
        const res = await chai.request(router).get("/1/assignments");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)[0].title).to.equal("Assignment 1");
    });

    /**
     * Test whether a course is updated.
     */
    it("Put /:courseId", async () => {
        // test the router
        const res = await chai.request(router)
            .put("/1")
            .send({
                faculty: "3ME",
                academic_year: "2018/2019",
                course_code: "2",
                courseId: 1,
                description: "example",
                name: "test name",
                enrollable: true
            });


        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({
            faculty: "3ME",
            academic_year: "2018/2019",
            course_code: "2",
            description: "example",
            name: "test name",
            enrollable: true
        });
    });

    /**
     * Test to get course specific information.
     */
    it("Get /:courseId", async () => {
        // test the router
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({
            faculty: "EWI",
            academic_year: "2019/2020",
            course_code: "ED1-1631",
            description: "This is a beautiful course description!",
            name: "ED-3",
            enrollable: true
        });
    });

    /**
     * Test to get information about a role for a specific user.
     */
    it("Get /:courseId/role", async () => {
        // test the router
        const res = await chai.request(router).get("/1/role");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
                role: "teacher"
            }
        ));
    });

    /**
     * Test put the role of a student, which is enrolled in the course.
     */
    it("Valid put enrolled /:courseId/setRole", async () => {
        // test the router
        const res = await chai.request(router)
            .put("/1/setRole")
            .send({ netid: "paulvanderlaan", role: Roles.teacher });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ courseId: 1, role: Roles.teacher }));
    });

    /**
     * Test put the role of a student, which is not enrolled in the course.
     */
    it("Valid put not enrolled /:courseId/setRole", async () => {
        // test the router
        const res = await chai.request(router)
            .put("/1/setRole")
            .send({ netid: "paulvanderlaan", role: Roles.teacher });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ courseId: 1, role: Roles.teacher }));
    });

    /**
     * Test put the role of a student, invalid request
     */
    it("Invalid put /:courseId/setRole", async () => {
        // test the router
        const res = await chai.request(router)
            .put("/1/setRole")
            .send({ netid: "paulvanderlaan", role: "invalid role" });
        expect(res.status).to.equal(400);
    });

    /**
     * Test put the role of a student, invalid request
     */
    it("GET /:courseId/users/:role/", async () => {
        // test the router
        const res = await chai.request(router).get("/1/users/student");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([{ user_netid: "paulvanderlaan" }]));
    });

    /**
     * Random review id
     */
    it("Empty course grade export", async () => {
        // log in as bplanje (teacher)cle
        MockLogin.initialize("bplanje");
        const res = await chai.request(router).get("/2/gradeExport/csv");
        expect(res.status).to.equal(400);
    });

    /**
     * enroll in an enrollable course
     */
    it("Enroll in an enrollable course", async () => {
        MockLogin.initialize("newstudent");
        const res = await chai.request(router).get("/1/enroll");
        expect(res.status).to.equal(200);
    });

    /**
     * enroll in an unenrollable course
     */
    it("Enroll in an unenrollable course", async () => {
        MockLogin.initialize("newstudent");
        const res = await chai.request(router).get("/3/enroll");
        expect(res.status).to.equal(401);
    });

    /**
     * enroll in a nonexisting course
     */
    it("Enroll in a nonexisting course", async () => {
        MockLogin.initialize("newstudent");
        const res = await chai.request(router).get("/3456/enroll");
        expect(res.status).to.equal(401);
    });
});