import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/submissions").default;

// Imitates the login of Okta for testing
// Note these field are also available outside of this test
// so make sure you re-initialize them when needed!
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";

const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("API submission routes", () => {
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
     * Tests if all comments are fetched for a specific submission.
     */
    it("GET submission/:submissionId/allComments", async () => {
        const res = await chai.request(router).get("/1/allComments");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{
                "id": 1,
                "comment": "Keep it up Brian!",
                "submission_id": 1,
                "ta_netid": "paulvanderlaan"
            }]
        ));
    });

    /**
     * Tests if a specific comment can be added.
     */
    it("POST submission/:submissionId/comment", async () => {
        const res = await chai.request(router)
            .post("/1/comment")
            .send({ ta_netid: "otherTA", comment: "new" });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 2,
                "comment": "new",
                "submission_id": 1,
                "ta_netid": "otherTA"
            }
        ));
    });

    /**
     * Tests if a specific comment can be updated.
     */
    it("PUT submission/:submissionId/comment", async () => {
        const res = await chai.request(router)
            .put("/1/comment")
            .send({ comment: "new" });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1,
                "comment": "new",
                "submission_id": 1,
                "ta_netid": "paulvanderlaan"
            }
        ));
    });

    /**
     * Tests if a specific comment can be deleted.
     */
    it("submission/:submissionId/comment", async () => {
        const res = await chai.request(router).del("/1/comment");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1,
                "comment": "Keep it up Brian!",
                "submission_id": 1,
                "ta_netid": "paulvanderlaan"
            }
        ));
    });

});