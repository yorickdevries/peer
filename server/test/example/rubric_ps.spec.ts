import RubricPS from "../../src/prepared_statements/rubric_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-TestDataBase.sql");

describe("RubricPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
    });


    /**
     * Test to create a rubric
     */
    it("create rubric", async() => {
        RubricPS.executeDeleteRubric(1);
        expect(await RubricPS.executeCreateRubric(1)).to.deep.equal({
            assignment_id: 1
        });
    });

    /**
     * Test to get info about a rubric
     */
    it("get rubric", async() => {
        expect(await RubricPS.executeGetRubricById(1)).to.deep.equal({
            assignment_id: 1
        });
    });

    /**
     * Test to create open question
     */
    it("create open quetion", async() => {
       expect(await RubricPS.executeCreateOpenQuestion("hi", 1, 1)).to.deep.equal({
           id: 2,
           question: "hi",
           question_number: 1,
           rubric_assignment_id: 1,
           type_question: "open"
       })
    });

    /**
     * Test to create mc question
     */
    it("create mc quetion", async() => {
        expect(await RubricPS.executeCreateMCQuestion("hi", 1, 1)).to.deep.equal({
            id: 2,
            question: "hi",
            question_number: 1,
            rubric_assignment_id: 1,
            type_question: "mc"
        })
    });

    /**
     * Test to create open question
     */
    it("create range quetion", async() => {
        expect(await RubricPS.executeCreateRangeQuestion("hi",6, 1, 1)).to.deep.equal({
            id: 2,
            question: "hi",
            question_number: 1,
            rubric_assignment_id: 1,
            range: 6,
            type_question: "range"
        })
    });

    /**
     * Test to create mc option
     */
    it("create mc option", async() => {
        expect(await RubricPS.executeCreateMCOption("hi", 1,)).to.deep.equal({
            id: 4,
            mcquestion_id: 1,
            option: "hi"

        })
    });

    /**
     * Test to update an open question
     */
    it("update open question", async() => {
        expect(await RubricPS.executeUpdateOpenQuestion("hi2", 1, 1, 1)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            rubric_assignment_id: 1,
            type_question: "open"
        });
    });

    /**
     * Test to update an range question
     */
    it("update range question", async() => {
        expect(await RubricPS.executeUpdateRangeQuestion("hi2", 6, 1, 1, 1)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            range: 6,
            rubric_assignment_id: 1,
            type_question: "range"
        });
    });

    /**
     * Test to update a mc question
     */
    it("update mc question", async() => {
        expect(await RubricPS.executeUpdateMCQuestion("hi2", 1, 1, 1)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            rubric_assignment_id: 1,
            type_question: "mc"
        });
    });











});