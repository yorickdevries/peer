import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import mockDate from "mockdate";
import fs from "fs-extra";
import path from "path";
chai.use(chaiHttp);
const router: any = require("../../src/routes/reviews").default;
import MockLogin from "../test_helpers/mock_login";
import TestData from "../test_helpers/test_data";
import ReviewPS from "../../src/prepared_statements/review_ps";
import SubmissionPS from "../../src/prepared_statements/submissions_ps";
import RubricPS from "../../src/prepared_statements/rubric_ps";
import config from "../../src/config";
import AssignmentPS from "../../src/prepared_statements/assignment_ps";
import GroupsPS from "../../src/prepared_statements/group_ps";

const fileFolder = config.reviews.fileFolder;

describe("API review routes", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        // initializes the router with user paul
        MockLogin.initialize("paulvanderlaan");
        await TestData.initializeDatabase();
        await TestData.initializeReviewFiles();
    });

    /**
     * Reset the date to the non-mocked form
     */
    afterEach(async () => {
        mockDate.reset();
        await TestData.removeReviewFiles();
    });

    /**
     * Tests if user has authorization to see the review
     */
    it("get review auth review", async() => {
        const res = await chai.request(router).get("/2");
        expect(res.status).to.equal(200);
    });

    /**
     * Tests if user has no authorization to see a non existing review
     */
    it("get review auth non-existing review", async() => {
        const res = await chai.request(router).get("/3");
        expect(res.status).to.equal(401);
    });

    /**
     * Tests if adversary user does not have authorization to see the review
     */
    it("get review unauthorized", async() => {
        // initializes the router with user adversary
        MockLogin.initialize("adversary");
        const res = await chai.request(router).get("/2");
        expect(res.status).to.equal(401);
    });

    /**
     * Tests whether reviews are returned
     */
    it("Get review/", async () => {
        const res = await chai.request(router).get("/2");
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text).review.id).to.equal(2);
    });

    /**
     * Put and submit a review with a valid file upload
     */
    it("Put review with valid file upload", async () => {
        mockDate.set("2019-10-02T21:00:00Z");
        MockLogin.initialize("paulvanderlaan");
        const exampleReviewFile = path.join(__dirname, "../../example_data/reviews/review1.pdf");

        const assignment: any = await AssignmentPS.executeAddAssignment("New", "Description", 1, 2, "test_file.pdf",
        new Date("2017-07-01T20:30:00Z"), new Date("2018-07-01T20:30:00Z"), new Date("2019-07-01T20:30:00Z"), new Date("2020-07-01T20:30:00Z"), false, false, undefined);
        const group: any = await GroupsPS.executeAddGroup("groupname");
        const submission: any = await SubmissionPS.executeCreateSubmission("henkjan", group.id, assignment.id, "none.pdf");
        const rubric: any = await RubricPS.executeCreateRubric(assignment.id, "submission");
        const review: any = await ReviewPS.executeCreateReview("paulvanderlaan", submission.id, rubric.id);
        const uploadQuestion: any = await RubricPS.executeCreateUploadQuestion("Hi there?", rubric.id, 1, ".pdf");

        // Submit a review with a uploaded file
        const res = await chai.request(router)
            .put(`/${review.id}`)
            .attach(`${uploadQuestion.id}`, fs.readFileSync(exampleReviewFile), "review1.pdf")
            .field("review", JSON.stringify({
                    "id": review.id,
                    "rubric_id": rubric.id,
                    "file_path": "none.pdf",
                    "done": false
                }))
            .field("form", JSON.stringify([{
                "question": {
                    "id": uploadQuestion.id,
                    "type_question": "upload",
                    "question": "Hi there?",
                    "question_number": 1,
                    "extension": ".pdf"
                }, "answer": {}
            }]));
        expect(res.status).to.equal(200);

        const filename = `${review.id}-${uploadQuestion.id}.pdf`;
        const filepath = path.join(fileFolder, filename);

        expect(fs.existsSync(filepath)).to.be.true;
    });

    /**
     * Put and submit a review with a invalid file upload
     */
    it("Put review with invalid file upload", async () => {
        mockDate.set("2018-05-02T21:00:00Z");
        MockLogin.initialize("paulvanderlaan");
        const exampleReviewFile = path.join(__dirname, "../../example_data/reviews/review2.zip");

        const submission: any = await SubmissionPS.executeCreateSubmission("paulvanderlaan", 10, 1, "none.pdf");
        const rubric: any = await RubricPS.executeCreateRubric(1, "submission");
        const review: any = await ReviewPS.executeCreateReview("paulvanderlaan", submission.id, 1);
        const uploadQuestion: any = await RubricPS.executeCreateUploadQuestion("Hi there?", rubric.id, 1, "pdf");

        // Submit a review with a uploaded file
        await chai.request(router)
            .put(`/${review.id}`)
            .attach(`${uploadQuestion.id}`, fs.readFileSync(exampleReviewFile), "review2.zip")
            .field("review", JSON.stringify({
                "id": review.id,
                "rubric_id": rubric.id,
                "file_path": "none.pdf",
                "done": false
            }))
            .field("form", JSON.stringify([{
                "question": {
                    "id": uploadQuestion.id,
                    "type_question": "upload",
                    "question": "Hi there?",
                    "question_number": 1,
                    "extension": "pdf"
                }, "answer": {}
            }]));

        const filename = `${review.id}-${uploadQuestion.id}.zip`;
        const filepath = path.join(fileFolder, filename);
        expect(await fs.existsSync(filepath)).to.be.false;
    });

    /**
     * Put and submit a review
     */
    it("Put and submit review", async () => {
        mockDate.set("2018-05-02T21:00:00Z");
        MockLogin.initialize("henkjan");

        const res = await chai.request(router)
            .put("/1")
            .send({
                "review": JSON.stringify({
                    "id": 2,
                    "rubric_id": 1,
                    "file_path": "submission1.pdf",
                    "done": false,
                    "flagged": false
                }),
                "form": JSON.stringify([{
                    "question": {
                        "id": 1,
                        "type_question": "mc",
                        "question": "What is the best way to insert queries?",
                        "question_number": 3,
                        "option": [
                          {"id": 3, "option": "By asking Brian", "mcquestion_id": 1},
                          {"id": 2, "option": "By using command line", "mcquestion_id": 1},
                          {"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}
                        ]
                    }, "answer": {"answer": 1, "mcquestion_id": 1, "review_id": 1}
                }, {
                    "answer": {"answer": 4, "mcquestion_id": 2, "review_id": 1},
                    "question": {
                      "id": 2,
                      "option": [
                        {
                          "id": 4,
                          "mcquestion_id": 2,
                          "option": "A"
                        }
                      ],
                      "question": "Is the right Answer A?",
                      "question_number": 4,
                      "rubric_id": 1,
                      "type_question": "mc"
                    }
                  }, {
                    "question": {
                        "id": 1,
                        "question": "How to insert queries?",
                        "rubric_id": 1,
                        "question_number": 1,
                        "type_question": "open"
                    },
                    "answer": {"answer": "Flesje water is beter dan flesje bier", "openquestion_id": 1, "review_id": 1}
                }, {
                    "question": {
                        "id": 1,
                        "question": "How much fun is inserting queries?",
                        "range": 7,
                        "rubric_id": 1,
                        "question_number": 2,
                        "type_question": "range"
                    }, "answer": {"answer": 4, "rangequestion_id": 1, "review_id": 1}
                }])
            });

        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal({
              "form": [
                {
                  "answer": {
                    "answer": "Flesje water is beter dan flesje bier",
                    "openquestion_id": 1,
                    "review_id": 1
                  },
                  "question": {
                    "id": 1,
                    "question": "How to insert queries?",
                    "question_number": 1,
                    "rubric_id": 1,
                    "type_question": "open"
                  }
                },
                {
                  "answer": {
                    "answer": 4,
                    "rangequestion_id": 1,
                    "review_id": 1
                  },
                  "question": {
                    "id": 1,
                    "question": "How much fun is inserting queries?",
                    "question_number": 2,
                    "range": 7,
                    "rubric_id": 1,
                    "type_question": "range"
                  }
                },
                {
                    "answer": {
                      "answer": 1,
                      "mcquestion_id": 1,
                      "review_id": 1
                    },
                    "question": {
                      "id": 1,
                      "option": [
                        {"id": 3, "option": "By asking Brian", "mcquestion_id": 1},
                        {"id": 2, "option": "By using command line", "mcquestion_id": 1},
                        {"id": 1, "option": "By using pgAdmin", "mcquestion_id": 1}
                      ],
                      "question": "What is the best way to insert queries?",
                      "question_number": 3,
                      "rubric_id": 1,
                      "type_question": "mc"
                    }
                  },
                  {
                    "answer": {"answer": 4, "mcquestion_id": 2, "review_id": 1},
                    "question": {
                      "id": 2,
                      "option": [
                        {
                          "id": 4,
                          "mcquestion_id": 2,
                          "option": "A"
                        }
                      ],
                      "question": "Is the right Answer A?",
                      "question_number": 4,
                      "rubric_id": 1,
                      "type_question": "mc"
                    }
                  }
              ],
              "review": {
                "done": false,
                  // tslint:disable-next-line
                  "approved": null,
                  "id": 1,
                "rubric_id": 1,
                  "flagged": false
              }
            });
        const result2 = await chai.request(router).get("/1/submit");
        expect(result2.status).to.equal(200);
        expect(JSON.parse(result2.text)[0].id).to.equal(1);
    });


    /**
     * Tests if all comments are fetched for a specific review.
     */
    it("GET review/:reviewId/allComments", async () => {
        MockLogin.initialize("henkjan");
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

    /**
     * Tests if a review can be approved.
     */
    it("review/:reviewId/grade", async () => {
        MockLogin.initialize("bplanje");
        const reviewId: number = 1;

        // Check if the approval and ta net id was previously null
        const resultBefore = await ReviewPS.executeGetReview(reviewId);
        // tslint:disable-next-line
        expect(resultBefore.approved).to.equal(null);
        expect(resultBefore.ta_netid).to.equal(undefined);

        const res = await chai.request(router)
            .post(`/${reviewId}/grade`)
            .send({approved: true});
        expect(res.status).to.equal(200);

        const resultAfter = await ReviewPS.executeGetReview(reviewId);
        expect(resultAfter.approved).to.equal(true);
    });
});