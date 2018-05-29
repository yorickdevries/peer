import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
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
        InitLogin.initialize(router, "henkjan");
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
            }
        ]));
    });

    /**
     * Tests whether courses are posted and returned
     */
    it("Put courses/", async () => {
        const res = await chai.request(router)
            .post("/")
            .send({ description: "example", name: "test name"});

        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
                id: 2,
                description: "example",
                name: "test name"
            }
        ));
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get courses/enrolled", async () => {
        // test the router
        const res = await chai.request(router).get("/enrolled");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([]));
    });


});