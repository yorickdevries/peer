import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
import "mocha";

const router: any = require("../../src/routes/reviews").default;

// Imitates the login of Okta for testing
// Note these field are also available outside of this test
// so make sure you re-initialize them when needed!
import InitLogin from "./init_login";

import Database from "../../src/database";
// load the queryfiles
import { QueryFile } from "pg-promise";

const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("API review routes", () => {
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
     * Tests whether reviews are returned
     */
    it("Get review/", async () => {
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "review": {
                    "id": 1,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
                    "comment": "Plagiaat",
                    "done": false
                },
                "form": [{
                    "question": {
                        "id": 1,
                        "type_question": "mc",
                        "rubric_assignment_id": 1,
                        "question": "What is the best way to insert queries?",
                        "question_number": 3,
                        "option": [{"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}, {
                            "id": 2,
                            "option": "By using command line",
                            "mcquestion_id": 1
                        }, {"id": 3, "option": "By asking Brian", "mcquestion_id": 1}]
                    }, "answer": {"answer": 1, "mcquestion_id": 1, "review_id": 1}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How to insert queries?",
                        "rubric_assignment_id": 1,
                        "question_number": 1,
                        "type_question": "open"
                    },
                    "answer": {"answer": "Flesje water is beter dan flesje bier", "openquestion_id": 1, "review_id": 1}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How much fun is inserting queries?",
                        "range": 7,
                        "rubric_assignment_id": 1,
                        "question_number": 2,
                        "type_question": "range"
                    }, "answer": {"answer": 4, "rangequestion_id": 1, "review_id": 1}
                }]
            }
        ));
    });

    /**
     * Tests whether review get submitted
     */
    it("submit review/", async () => {
        const res = await chai.request(router).get("/1/submit");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{
                "id": 1,
                "comment": "Plagiaat",
                "user_netid": "henkjan",
                "submission_id": 1,
                "rubric_assignment_id": 1,
                "done": true
            }]
        ));
    });

    /**
     * Put a review
     */
    it("Put review/", async () => {
        const res = await chai.request(router)
            .put("/1")
            .send({
                "review": {
                    "id": 1,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
                    "comment": "Plagiaat!!!",
                    "done": false
                },
                "form": [{
                    "question": {
                        "id": 1,
                        "type_question": "mc",
                        "question": "What is the best way to insert queries?",
                        "question_number": 3,
                        "option": [{"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}, {
                            "id": 2,
                            "option": "By using command line",
                            "mcquestion_id": 1
                        }, {"id": 3, "option": "By asking Brian", "mcquestion_id": 1}]
                    }, "answer": {"answer": 1, "mcquestion_id": 1, "review_id": 1}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How to insert queries?",
                        "rubric_assignment_id": 1,
                        "question_number": 1,
                        "type_question": "open"
                    },
                    "answer": {"answer": "Flesje water is beter dan flesje bier", "openquestion_id": 1, "review_id": 1}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How much fun is inserting queries?",
                        "range": 7,
                        "rubric_assignment_id": 1,
                        "question_number": 2,
                        "type_question": "range"
                    }, "answer": {"answer": 4, "rangequestion_id": 1, "review_id": 1}
                }]
            });

        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify({
                "review": {
                    "id": 1,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
                    "comment": "Plagiaat",
                    "done": false
                },
                "form": [{
                    "question": {
                        "id": 1,
                        "type_question": "mc",
                        "question": "What is the best way to insert queries?",
                        "question_number": 3,
                        "option": [{"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}, {
                            "id": 2,
                            "option": "By using command line",
                            "mcquestion_id": 1
                        }, {"id": 3, "option": "By asking Brian", "mcquestion_id": 1}]
                    }, "answer": {"answer": 1}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How to insert queries?",
                        "rubric_assignment_id": 1,
                        "question_number": 1,
                        "type_question": "open"
                    }, "answer": {"answer": "Flesje water is beter dan flesje bier"}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How much fun is inserting queries?",
                        "range": 7,
                        "rubric_assignment_id": 1,
                        "question_number": 2,
                        "type_question": "range"
                    }, "answer": {"answer": 4}
                }]
            }
        ));
    });


});