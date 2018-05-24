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
        expect(await ReviewPS.executeGetReview(1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Submit review by id.
     */
    it("submit review by id", async () => {
        expect(await ReviewPS.executeSubmitReview(1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Update mc answer.
     */
    it("update mc answer", async () => {
        expect(await ReviewPS.executeUpdateMpcAnswer(1, 1, 1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Update open answer.
     */
    it("update open answer", async () => {
        expect(await ReviewPS.executeUpdateOpenAnswer("new", 1, 1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Update range answer.
     */
    it("update range answer", async () => {
        expect(await ReviewPS.executeUpdateRangeAnswer(2, 1, 1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Get mc answer.
     */
    it("get mc answer by id", async () => {
        expect(await ReviewPS.executeGetMCAnswer(1, 1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Get open answer.
     */
    it("get open answer by id", async () => {
        expect(await ReviewPS.executeGetOpenAnswer(1, 1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });

    /**
     * Get range answer.
     */
    it("get range answer by id", async () => {
        expect(await ReviewPS.executeGetRangeAnswer(1, 1)).to.deep.equal([{
            description: "This is a beautiful course description!",
            id: 1,
            name: "ED-3"
        }]);
    });
});