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
        MockLogin.initialize("bplanje");
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

    /**
     * Test whether groups are deleted.
     */
    it("Delete groups/:id", async () => {
        // test whether the group exists
        const existsRes = await chai.request(router).get("/10");
        expect(existsRes.text).to.equal(JSON.stringify({id: 10, group_name: "ED-3"}));

        // delete the group
        const deleteRes = await chai.request(router).del("/10");
        expect(deleteRes.status).to.equal(200);

        // test whether group does not exist
        const notExistRes = await chai.request(router).get("/10");
        expect(notExistRes.status).to.equal(401);
    });

    /**
     * Test whether group members are deleted.
     */
    it("Delete groups/:id", async () => {
        // test whether the group member exists
        const existRes = await chai.request(router).get("/10/users");
        expect(existRes.text).to.equal(JSON.stringify([
            {user_netid: "henkjan", group_groupid: 10},
            {user_netid: "paulvanderlaan", group_groupid: 10}
        ]));

        // delete the group
        const deleteRes = await chai.request(router).del("/10/users/paulvanderlaan");
        expect(deleteRes.status).to.equal(200);

        // test whether group does not exist
        const notExistRes = await chai.request(router).get("/10/users");
        expect(notExistRes.text).to.equal(JSON.stringify([
            {user_netid: "henkjan", group_groupid: 10}
        ]));
    });
});