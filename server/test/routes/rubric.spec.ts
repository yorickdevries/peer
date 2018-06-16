import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/rubric").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

describe("API review routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        MockLogin.initialize("bplanje");
        await TestData.initializeDatabase();
    });

    /**
     * Test if a rubric can be fetched
     */
    it("rubric/:rubric_id", async () => {
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);

        const result = JSON.parse(res.text);
        expect(result.id).to.equal("1");
    });

    /**
     * Test if a rubric can be created
     */
    it("rubric/", async () => {
        const res = await chai.request(router)
            .post("/")
            .send({ rubric_assignment_id: 3 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "assignment_id": 3
            }
        ));
    });

    /**
     * Test if an option for a multiple choice question can be created
     */
    it("rubric/mcoption", async () => {
        const res = await chai.request(router)
            .post("/mcoption")
            .send({ option: "opt", mcquestion_id: 1 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 5, "option": "opt", "mcquestion_id": 1
            }
        ));
    });

    /**
     * Test if an mcoption can be updated
     */
    it("rubric/mcoption/:option_id", async () => {
        const res = await chai.request(router)
            .put("/mcoption/1")
            .send({ option: "optNew", mcquestion_id: 1 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1, "option": "optNew", "mcquestion_id": 1
            }
        ));
    });

    /**
     * Test if a multiple choice question can be created
     */
    it("rubric/mcquestion", async () => {
        const res = await chai.request(router)
            .post("/mcquestion")
            .send({ question: "opt", rubric_assignment_id: 1, question_number: 1 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 3, "question": "opt", "rubric_assignment_id": 1, "question_number": 1, "type_question": "mc"
            }
        ));
    });


    /**
     * Test if an mcquestion can be updated
     */
    it("rubric/mcquestion/:question_id", async () => {
        const res = await chai.request(router)
            .put("/mcquestion/1")
            .send({ question: "optNew", question_number: 2 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1, "question": "optNew", "rubric_assignment_id": 1, "question_number": 2, "type_question": "mc"
            }
        ));
    });

    /**
     * Test if a rangequestion can be created
     */
    it("rubric/rangequestion", async () => {
        const res = await chai.request(router)
            .post("/rangequestion")
            .send({ question: "opt", range: 3, rubric_assignment_id: 1, question_number: 1 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 2,
                "question": "opt",
                "range": 3,
                "rubric_assignment_id": 1,
                "question_number": 1,
                "type_question": "range"
            }
        ));
    });


    /**
     * Test if an rangequestion can be updated
     */
    it("rubric/rangequestion/:question_id", async () => {
        const res = await chai.request(router)
            .put("/rangequestion/1")
            .send({ question: "optNew", range: 4, question_number: 2 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
                "id": 1,
                "question": "optNew",
                "range": 4,
                "rubric_assignment_id": 1,
                "question_number": 2,
                "type_question": "range"
            }
        ));
    });

    /**
     * Test if a openquestion can be created
     */
    it("rubric/openquestion", async () => {
        const res = await chai.request(router)
            .post("/openquestion")
            .send({ question: "opt", rubric_assignment_id: 1, question_number: 1 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 2,
                "question": "opt",
                "rubric_assignment_id": 1,
                "question_number": 1,
                "type_question": "open"
            }
        ));
    });


    /**
     * Test if an openquestion can be updated
     */
    it("rubric/openquestion/:question_id", async () => {
        const res = await chai.request(router)
            .put("/openquestion/1")
            .send({ question: "optNew", question_number: 2 });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
                "id": 1,
                "question": "optNew",
                "rubric_assignment_id": 1,
                "question_number": 2,
                "type_question": "open"
            }
        ));
    });

    /**
     * Tests if an open question can be deleted.
     */
    it("rubric/openquestion/:id", async () => {
        // Create a question
        const res1 = await chai.request(router)
        .post("/openquestion")
        .send({ question: "opt", rubric_assignment_id: 1, question_number: 1 });
        const newq = JSON.parse(res1.text);

        // Delete a question
        const res2 = await chai.request(router).del("/openquestion/" + newq.id);
        expect(res2.status).to.equal(200);
        expect(res2.text).to.equal(JSON.stringify(
            {
                "id": newq.id,
                "question": "opt",
                "rubric_assignment_id": 1,
                "question_number": 1,
                "type_question": "open"
            }
        ));
    });

    /**
     * Tests if a mc question can be deleted.
     */
    it("rubric/mcquestion/:id", async () => {
        // Create a question
        const res1 = await chai.request(router)
        .post("/mcquestion")
        .send({ question: "opt", rubric_assignment_id: 1, question_number: 1 });
        const newq = JSON.parse(res1.text);

        // Delete a question
        const res = await chai.request(router).del("/mcquestion/" + newq.id);
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": newq.id,
                "question": "opt",
                "rubric_assignment_id": 1,
                "question_number": 1,
                "type_question": "mc"
            }
        ));
    });

    /**
     * Tests if a range question can be deleted.
     */
    it("rubric/rangequestion/:id", async () => {
        // Create a question
        const res1 = await chai.request(router)
        .post("/rangequestion")
        .send({ question: "optNew", range: 4, rubric_assignment_id: 2, question_number: 2 });
        const newq = JSON.parse(res1.text);

        // Delete a question
        const res = await chai.request(router).del("/rangequestion/" + newq.id);
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": newq.id,
                "question": "optNew",
                "range": 4,
                "rubric_assignment_id": 2,
                "question_number": 2,
                "type_question": "range"
            }
        ));
    });

    /**
     * Tests if a mc option can be deleted.
     */
    it("rubric/mcoption/:id", async () => {
        const res = await chai.request(router).del("/mcoption/2");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 2, "option": "By using command line", "mcquestion_id": 1
            }
        ));
    });

});