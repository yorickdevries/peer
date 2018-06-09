import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/api").default;
// Imitates the login of Okta for testing
// Note these field are also available outside of this test
// so make sure you re-initialize them when needed!
import MockLogin from "../test_helpers/mock_login";

import TestDatabase from "../test_helpers/test_database";

import UserPS from "../../src/prepared_statements/user_ps";

describe("API root routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router without an user
        MockLogin.initialize(router);
        await TestDatabase.initialize();
    });

    /**
     * Test whether user is not authenticated
     */
    it("Get /authenticated info while not logged in", async () => {
        // initializes router without an user logged in
        MockLogin.initialize(router);
        const res = await chai.request(router).get("/authenticated");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ authenticated: false }));
    });

    /**
     * Test whether user is authenticated
     */
    it("Get /authenticated info while logged in", async () => {
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/authenticated");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({ authenticated: true }));
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get /user info - netid", async () => {
        MockLogin.initialize(router, "henkjan");
        const res = await chai.request(router).get("/user");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).user.given_name).to.equal("henkjan");
    });

    /**
     * Test whether userinfo is returned
     */
    it("Get /user info email", async () => {
        MockLogin.initialize(router, "henkjan", "h.j@dtudent.tudelft.nl");
        const res = await chai.request(router).get("/user");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).user.preferred_username).to.equal("h.j@dtudent.tudelft.nl");
    });

    /**
     * Test whether user is added to the database
     */
    it("User is added upon login", async () => {
        MockLogin.initialize(router, "newuser", "newemail@mail");
        const res = await chai.request(router).get("/anything");
        const user: any = await UserPS.executeGetUserById("newuser");
        expect(user.netid).to.equal("newuser");
        expect(user.email).to.equal("newemail@mail");
    });

    /**
     * Test whether useremail is updated to the database
     */
    it("Useremail is updated to the database", async () => {
        // first session
        MockLogin.initialize(router, "newuser", "email@mail.nl");
        await chai.request(router).get("/anything");
        const user: any = await UserPS.executeGetUserById("newuser");
        expect(user.netid).to.equal("newuser");
        expect(user.email).to.equal("email@mail.nl");
        // second session
        MockLogin.initialize(router, "newuser", "newemail@mail.nl");
        await chai.request(router).get("/anything");
        const user2: any = await UserPS.executeGetUserById("newuser");
        expect(user2.netid).to.equal("newuser");
        expect(user2.email).to.equal("newemail@mail.nl");
    });
});