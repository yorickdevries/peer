import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/groups").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

describe("API Group routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user henkjan
        MockLogin.initialize(router, "bplanje");
        await TestData.initializeDatabase();
    });


    /**
     * Test whether one group is returned
     */
    it("Get courses/:id", async () => {
        // test the router
        const res = await chai.request(router).get("/10");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({id: 10, group_name: "ED-3"}));
    });

    /**
     * Test whether access is denied
     */
    it("Get courses/:id access denied", async () => {
        // test the router
        const res = await chai.request(router).get("/11");
        expect(res.status).to.equal(401);
    });

    /**
     * Test whether the users of a group are returned
     */
    it("Get courses/:id/users", async () => {
        // test the router
        const res = await chai.request(router).get("/10/users");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify([
            {user_netid: "henkjan", group_groupid: 10},
            {user_netid: "paulvanderlaan", group_groupid: 10}
        ]));
    });
});