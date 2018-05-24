import ReviewPS from "../../src/prepared_statements/review_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-TestDataBase.sql");

describe("ReviewPreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
    });

    /**
     * Get review by id.
     */
    it("get all review by id", async () => {
        expect(await ReviewPS.executeGetReview(1)).to.deep.equal({
            id: 1,
            comment: "Plagiaat",
            done: false,
            file_path: "submission1.pdf",
            rubric_assignment_id: 1
        });
    });

    /**
     * Submit review by id.
     */
    it("submit review by id", async () => {
        expect(await ReviewPS.executeSubmitReview(1)).to.deep.equal([{
            id: 1,
            rubric_assignment_id: 1,
            submission_id: 1,
            user_netid: "henkjan",
            comment: "Plagiaat",
            done: true
        }]);
    });

    /**
     * Update mc answer.
     */
    it("update mc answer", async () => {
        expect(await ReviewPS.executeUpdateMpcAnswer(1, 1, 1)).to.deep.equal({
            answer: 1
        });
    });

    /**
     * Update open answer.
     */
    it("update open answer", async () => {
        expect(await ReviewPS.executeUpdateOpenAnswer("new", 1, 1)).to.deep.equal({
            answer: "new"
        });
    });

    /**
     * Update range answer.
     */
    it("update range answer", async () => {
        expect(await ReviewPS.executeUpdateRangeAnswer(2, 1, 1)).to.deep.equal({
            answer: 2
        });
    });

    /**
     * Get mc answer.
     */
    it("get mc answer by id", async () => {
        expect(await ReviewPS.executeGetMCAnswer(1, 1)).to.deep.equal({
            answer: 1,
            mcquestion_id: 1,
            review_id: 1
        });
    });

    /**
     * Get open answer.
     */
    it("get open answer by id", async () => {
        expect(await ReviewPS.executeGetOpenAnswer(1, 1)).to.deep.equal({
            answer: "Flesje water is beter dan flesje bier",
            openquestion_id: 1,
            review_id: 1

        });
    });

    /**
     * Get range answer.
     */
    it("get range answer by id", async () => {
        expect(await ReviewPS.executeGetRangeAnswer(1, 1)).to.deep.equal({
            answer: 4,
            rangequestion_id: 1,
            review_id: 1
        });
    });
});