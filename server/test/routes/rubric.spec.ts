import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/old_api/routes/rubric").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

describe("API rubric routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        MockLogin.initialize("bplanje");
        await TestData.initializeDatabase();
    });

    /**
     * Test if a rubric can be created
     */
    it("rubric/", async () => {
        const res = await chai.request(router)
            .post("/")
            .send({ assignment_id: 3,
                rubric_type: "submission"
            });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {id: 3,
            assignment_id: 3,
            type: "submission"}
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
            .send({ question: "opt", rubric_id: 1, question_number: 1, optional: false });
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": 3, "question": "opt", "rubric_id": 1, "question_number": 1, "type_question": "mc", optional: false
            }
        );
    });


    /**
     * Test if an mcquestion can be updated
     */
    it("rubric/mcquestion/:question_id", async () => {
        const res = await chai.request(router)
            .put("/mcquestion/1")
            .send({ question: "optNew", question_number: 2, optional: false });
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": 1, "question": "optNew", "rubric_id": 1, "question_number": 2, "type_question": "mc", optional: false
            }
        );
    });

    /**
     * Test if an uploadquestion can be created
     */
    it("rubric/uploadquestion", async () => {
        const res = await chai.request(router)
            .post("/uploadquestion")
            .send({ question: "opt", extension: "pdf", rubric_id: 1, question_number: 1, optional: false });

        expect(res.status).to.equal(200);

        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": 1,
                "question": "opt",
                "extension": "pdf",
                "rubric_id": 1,
                "question_number": 1,
                "type_question": "upload",
                optional: false
            }
        );
    });

    /**
     * Test if an uploadquestion can be updated
     */
    it("rubric/uploadquestion update", async () => {
        const updatedQuestion = "new question";
        const updatedExtension = "zip";
        const updatedQuestionNumber = 2;
        const updatedOptional = true;

        const created = await chai.request(router)
            .post("/uploadquestion")
            .send({ question: "opt", extension: "pdf", rubric_id: 1, question_number: 1, optional: false });

        expect(created.status).to.equal(200);

        const updated = await chai.request(router)
            .put(`/uploadquestion/${created.body.id}`)
            .send({ question: updatedQuestion, extension: updatedExtension, question_number: updatedQuestionNumber, optional: updatedOptional });

        expect({
            updatedQuestion: updated.body.question,
            updatedExtension: updated.body.extension,
            updatedQuestionNumber: updated.body.question_number,
            updatedOptional: updated.body.optional
        }).to.deep.equal({
            updatedQuestion,
            updatedExtension,
            updatedQuestionNumber,
            updatedOptional
        });
    });

    /**
     * Test if an uploadquestion can be deleted
     */
    it("rubric/uploadquestion deleted", async () => {
        const created = await chai.request(router)
            .post("/uploadquestion")
            .send({ question: "opt", extension: "pdf", rubric_id: 1, question_number: 1, optional: false });

        expect(created.status).to.equal(200);

        const deleted = await chai.request(router)
            .del(`/uploadquestion/${created.body.id}`);

        expect(deleted.status).to.equal(200);
    });

    /**
     * Test if a rangequestion can be created
     */
    it("rubric/rangequestion", async () => {
        const res = await chai.request(router)
            .post("/rangequestion")
            .send({ question: "opt", range: 3, rubric_id: 1, question_number: 1, optional: false });
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": 2,
                "question": "opt",
                "range": 3,
                "rubric_id": 1,
                "question_number": 1,
                "type_question": "range",
                optional: false
            }
        );
    });


    /**
     * Test if an rangequestion can be updated
     */
    it("rubric/rangequestion/:question_id", async () => {
        const res = await chai.request(router)
            .put("/rangequestion/1")
            .send({ question: "optNew", range: 4, question_number: 2, optional: false });
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal({
                "id": 1,
                "question": "optNew",
                "range": 4,
                "rubric_id": 1,
                "question_number": 2,
                "type_question": "range",
                optional: false
            }
        );
    });

    /**
     * Test if a openquestion can be created
     */
    it("rubric/openquestion", async () => {
        const res = await chai.request(router)
            .post("/openquestion")
            .send({ question: "opt", rubric_id: 1, question_number: 1, optional: false });
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": 3,
                "question": "opt",
                "rubric_id": 1,
                "question_number": 1,
                "type_question": "open",
                optional: false
            }
        );
    });


    /**
     * Test if an openquestion can be updated
     */
    it("rubric/openquestion/:question_id", async () => {
        const res = await chai.request(router)
            .put("/openquestion/1")
            .send({ question: "optNew", question_number: 2, optional: false });
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal({
                "id": 1,
                "question": "optNew",
                "rubric_id": 1,
                "question_number": 2,
                "type_question": "open",
                optional: false
            }
        );
    });

    /**
     * Tests if an open question can be deleted.
     */
    it("rubric/openquestion/:id", async () => {
        // Create a question
        const res1 = await chai.request(router)
        .post("/openquestion")
        .send({ question: "opt", rubric_id: 1, question_number: 1, optional: false });
        const newq = JSON.parse(res1.text);

        // Delete a question
        const res2 = await chai.request(router).del("/openquestion/" + newq.id);
        expect(res2.status).to.equal(200);
        expect(JSON.parse(res2.text)).to.deep.equal(
            {
                "id": newq.id,
                "question": "opt",
                "rubric_id": 1,
                "question_number": 1,
                "type_question": "open",
                optional: false
            }
        );
    });

    /**
     * Tests if a mc question can be deleted.
     */
    it("rubric/mcquestion/:id", async () => {
        // Create a question
        const res1 = await chai.request(router)
        .post("/mcquestion")
        .send({ question: "opt", rubric_id: 1, question_number: 1, optional: false });
        const newq = JSON.parse(res1.text);

        // Delete a question
        const res = await chai.request(router).del("/mcquestion/" + newq.id);
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": newq.id,
                "question": "opt",
                "rubric_id": 1,
                "question_number": 1,
                "type_question": "mc",
                optional: false
            }
        );
    });

    /**
     * Tests if a range question can be deleted.
     */
    it("rubric/rangequestion/:id", async () => {
        // Create a question
        const res1 = await chai.request(router)
        .post("/rangequestion")
        .send({ question: "optNew", range: 4, rubric_id: 2, question_number: 2, optional: false });
        const newq = JSON.parse(res1.text);

        // Delete a question
        const res = await chai.request(router).del("/rangequestion/" + newq.id);
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "id": newq.id,
                "question": "optNew",
                "range": 4,
                "rubric_id": 2,
                "question_number": 2,
                "type_question": "range",
                optional: false
            }
        );
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