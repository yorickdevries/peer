import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/assignments").default;
// Imitates the login of Okta for testing
// Note these field are also available outside of this test
// so make sure you re-initialize them when needed!
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("API Assignment routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user henkjan
        InitLogin.initialize(router, "henkjan");
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });

    /**
     * Test whether userinfo is returned
     */
    it("Count assignment/id/reviewCount", async () => {
        // test the router
        const res = await chai.request(router).get("/1/reviewCount");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {"id":1,"comment":"Plagiaat","user_netid":"henkjan","submission_id":1,"rubric_assignment_id":1,"done":false}
            ));
    });
});