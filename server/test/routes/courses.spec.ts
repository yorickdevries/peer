import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import { Roles } from "../../src/roles";

chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/courses").default;

// Imitates the login of Okta for testing
// Note these field are also available outside of this test
// so make sure you re-initialize them when needed!
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";

const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("API Course routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        InitLogin.initialize(router, "paulvanderlaan");
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
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
        expect(res.text).to.equal(JSON.stringify({
                id: 3,
                description: "example",
                name: "test name"
            }
        ));

        const enrolled = await chai.request(router).get("/enrolled");
        expect(enrolled.status).to.equal(200);
        expect(enrolled.text).to.equal(JSON.stringify([{
            id: 1,
            description: "This is a beautiful course description!",
            name: "ED-3"
        }, {
            id: 3,
            description: "example",
            name: "test name"
        }]));
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get courses/enrolled", async () => {
        // test the router
        const res = await chai.request(router).get("/enrolled");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([{
            id: 1,
            description: "This is a beautiful course description!",
            name: "ED-3"
        }]));
    });

    /**
     * Test whether all assignments for a specific course are fetched.
     */
    it("Get /:courseId/assignments", async () => {
        // test the router
        const res = await chai.request(router).get("/1/assignments");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([{
                "title": "Assignment 1",
                "description": "Example assignment number one",
                "due_date": "2018-05-01T20:30:00.000Z",
                "publish_date": "2018-04-01T20:30:00.000Z",
                "id": 1,
                "course_id": 1,
                "reviews_per_user": 2,
                "filename": "assignment1.pdf",
                "review_due_date": "2018-05-01T20:30:00.000Z",
                "review_publish_date": "2018-04-01T20:30:00.000Z"
            }, {
                "title": "Assignment 2",
                "description": "Example assignment number two",
                "due_date": "2018-05-01T20:30:00.000Z",
                "publish_date": "2018-04-01T20:30:00.000Z",
                "id": 2,
                "course_id": 1,
                "reviews_per_user": 2,
                "filename": "assignment2.pdf",
                "review_due_date": "2018-05-01T20:30:00.000Z",
                "review_publish_date": "2018-04-01T20:30:00.000Z"
            }]
        ));
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
                role: "student"
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
            .put("/2/setRole")
            .send({ netid: "paulvanderlaan", role: Roles.teacher });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ courseId: 2, role: Roles.teacher }));
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