import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/submissions").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

describe("submission comment routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        MockLogin.initialize("paulvanderlaan");
        await TestData.initializeDatabase();
    });

    /**
     * Tests if all comments are fetched for a specific submission.
     */
    it("GET submission/:submissionId/allComments", async () => {
        MockLogin.initialize("paulvanderlaan");
        const res = await chai.request(router).get("/1/allComments");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{
                "id": 1,
                "comment": "Keep it up Brian!",
                "submission_id": 1,
                "netid": "paulvanderlaan"
            }]
        ));
    });

    /**
     * Tests if a specific comment can be added.
     */
    it("POST submission/:submissionId/comment", async () => {
        const res = await chai.request(router)
            .post("/1/comment")
            .send({ netid: "otherTA", comment: "new" });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 2,
                "comment": "new",
                "submission_id": 1,
                "netid": "otherTA"
            }
        ));
    });

    /**
     * Tests if a specific comment can be updated.
     */
    it("PUT submission/:submissionCommentId/comment", async () => {
        const res = await chai.request(router)
            .put("/1/comment")
            .send({ comment: "new" });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1,
                "comment": "new",
                "submission_id": 1,
                "netid": "paulvanderlaan"
            }
        ));
    });

    /**
     * Tests if a specific comment can be deleted.
     */
    it("submission/:submissionCommentId/comment", async () => {
        const res = await chai.request(router).del("/1/comment");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1,
                "comment": "Keep it up Brian!",
                "submission_id": 1,
                "netid": "paulvanderlaan"
            }
        ));
    });

});