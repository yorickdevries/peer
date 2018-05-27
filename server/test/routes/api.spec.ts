import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/api").default;
// Imitates the login of Okta for testing
// Note these field are also available outside of this test
// so make sure you re-initialize them when needed!
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("API root routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router without an user
        InitLogin.initialize(router);
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });

    /**
     * Test whether user is not authenticated
     */
    it("Get /authenticated info while not logged in", async () => {
        // initializes router without an user logged in
        InitLogin.initialize(router);
        const res = await chai.request(router).get("/authenticated");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ authenticated: false }));
    });

    /**
     * Test whether user is authenticated
     */
    it("Get /authenticated info while logged in", async () => {
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/authenticated");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ authenticated: true }));
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get /user info - netid", async () => {
        InitLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/user");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).user.given_name).to.equal("henkjan");
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get /user info email", async () => {
        InitLogin.initialize(router, "henkjan", "h.j@dtudent.tudelft.nl");
        const res = await chai.request(router).get("/user");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).user.preferred_username).to.equal("h.j@dtudent.tudelft.nl");
    });
});