import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/groups").default;
// Imitates the login of Okta for testing
import MockLogin from "../test_helpers/mock_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("API Group routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user teacheraccount
        MockLogin.initialize(router, "teacheraccount");
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });

    /**
     * Tests whether groups are returned
     */
    it("Get groups/", async () => {
        const res = await chai.request(router).get("/");
        expect(res.status).to.equal(200);
        expect(res.text).to.deep.equal(JSON.stringify([
            {id: 10, group_name: "ED-3"},
            {id: 20, group_name: "Group 20"},
            {id: 21, group_name: "Group 21"},
            {id: 22, group_name: "Group 22"}
        ]));
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