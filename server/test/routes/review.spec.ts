import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
const router: any = require("../../src/routes/reviews").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";

describe("API review routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        MockLogin.initialize("paulvanderlaan");
        await TestData.initializeDatabase();
    });

    /**
     * Tests if user has authorization to see the review
     */
    it("get review auth", async() => {
        const res = await chai.request(router).get("/3");
        expect(res.status).to.equal(401);
    });

    /**
     * Tests whether reviews are returned
     */
    it("Get review/", async () => {
        const res = await chai.request(router).get("/1");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal(
            {
                "review": {
                    "id": 1,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
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
                       "id": 2,
                       "type_question": "mc",
                       "rubric_assignment_id": 1,
                       "question": "Is the right Answer A?",
                       "question_number": 4,
                       "option": [
                          {
                             "id": 4,
                             "option": "A",
                             "mcquestion_id": 2
                          }
                       ]
                    },
                    "answer": {
                       "answer": ""
                    }
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
        );
    });

    /**
     * Tests whether review get submitted
     */
    it("submit review/", async () => {
        MockLogin.initialize("henkjan");
        const res = await chai.request(router).get("/1/submit");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{
                "id": 1,
                "user_netid": "henkjan",
                "submission_id": 1,
                "rubric_assignment_id": 1,
                "done": true,
                "creation_date": JSON.parse(res.text)[0].creation_date,
                "grade": -1
            }]
        ));
    });

    /**
     * Put a review
     */
    it("Put review/", async () => {
        MockLogin.initialize("henkjan");

        const res = await chai.request(router)
            .put("/1")
            .send({
                "review": {
                    "id": 2,
                    "rubric_assignment_id": 1,
                    "file_path": "submission1.pdf",
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
        }));
    });


    /**
     * Tests if all comments are fetched for a specific review.
     */
    it("GET review/:reviewId/allComments", async () => {
        const res = await chai.request(router).get("/1/allComments");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            [{
                "id": 1,
                "comment": "Keep it up Brian!",
                "review_id": 1,
                "netid": "paulvanderlaan"
            }]
        ));
    });

    /**
     * Tests if a specific comment can be added.
     */
    it("POST review/:reviewId/comment", async () => {
        MockLogin.initialize("bplanje");
        const res = await chai.request(router)
            .post("/1/comment")
            .send({ comment: "new" });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 2,
                "comment": "new",
                "review_id": 1,
                "netid": "bplanje"
            }
        ));
    });

    /**
     * Tests if a specific comment can be updated.
     */
    it("PUT review/:reviewCommentId/comment", async () => {
        MockLogin.initialize("paulvanderlaan");
        const res = await chai.request(router)
            .put("/1/comment")
            .send({ comment: "new" });
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1,
                "comment": "new",
                "review_id": 1,
                "netid": "paulvanderlaan"
            }
        ));
    });

    /**
     * Tests if a specific comment can be deleted.
     */
    it("review/:reviewCommentId/comment", async () => {
        const res = await chai.request(router).del("/1/comment");
        expect(res.status).to.equal(200);
        expect(res.text).to.equal(JSON.stringify(
            {
                "id": 1,
                "comment": "Keep it up Brian!",
                "review_id": 1,
                "netid": "paulvanderlaan"
            }
        ));
    });

});