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
        MockLogin.initialize("bplanje");
        await TestData.initializeDatabase();
    });

    /**
     * Tests whether courses are returned
     */
    it("Get courses/", async () => {
        const res = await chai.request(router).get("/");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([
            {
                id: 1,
                description: "This is a beautiful course description!",
                name: "ED-3"
            },
            {
                "id": 2,
                "description": "Test-course",
                "name": "ED-4"
            }
        ]));
    });

    /**
     * Tests whether courses are posted and returned
     */
    it("Put courses/", async () => {
        const res = await chai.request(router)
            .post("/")
            .send({description: "example", name: "test name"});

        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({"id": 3, "description": "example", "name": "test name"}
        ));

        const result = await chai.request(router).get("/enrolled");
        expect(result.status).to.equal(200);

        const enrolledlist: any = JSON.parse(result.text);
        const newcourse = enrolledlist.find((object: any) => object.id == 3);
        expect(newcourse).to.deep.equal({
            "id": 3,
            "description": "example",
            "name": "test name"
        });
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get courses/enrolled", async () => {
        // test the router
        const res = await chai.request(router).get("/enrolled");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([{
            "id": 1,
            "description": "This is a beautiful course description!",
            "name": "ED-3"
        }, {"id": 2, "description": "Test-course", "name": "ED-4"}]));
    });

    /**
     * Test whether all assignments for a specific course are fetched.
     */
    it("Get /:courseId/assignments", async () => {
        // test the router
        const res = await chai.request(router).get("/1/assignments");
        console.log(res.text);
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
            .send({courseId: 1, description: "example", name: "test name"});
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
            id: 1,
            description: "example",
            name: "test name"
        }));
    });

    /**
     * Test to get course specific information.
     */
    it("Get /:courseId", async () => {
        // test the router
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
            id: 1,
            description: "This is a beautiful course description!",
            name: "ED-3"
        }));
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
});