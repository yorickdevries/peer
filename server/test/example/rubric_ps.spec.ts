import RubricPS from "../../src/prepared_statements/rubric_ps";
import {expect} from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfiles
import { QueryFile } from "pg-promise";
const qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
const qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

describe("RubricPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(qfSchema);
        await Database.DatabaseImport(qfData);
    });


    /**
     * Test to create a rubric
     */
    it("create rubric", async () => {
        RubricPS.executeDeleteRubric(1);
        expect(await RubricPS.executeCreateRubric(1)).to.deep.equal({
            assignment_id: 1
        });
    });

    /**
     * Test to get info about a rubric
     */
    it("get rubric", async () => {
        expect(await RubricPS.executeGetRubricById(1)).to.deep.equal({
            assignment_id: 1
        });
    });

    /**
     * Test to create open question
     */
    it("create open quetion", async () => {
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
    it("create mc quetion", async () => {
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
    it("create range quetion", async () => {
        expect(await RubricPS.executeCreateRangeQuestion("hi", 6, 1, 1)).to.deep.equal({
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
    it("create mc option", async () => {
        expect(await RubricPS.executeCreateMCOption("hi", 1,)).to.deep.equal({
            id: 4,
            mcquestion_id: 1,
            option: "hi"

        })
    });

    /**
     * Test to update an open question
     */
    it("update open question", async () => {
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
    it("update range question", async () => {
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
    it("update mc question", async () => {
        expect(await RubricPS.executeUpdateMCQuestion("hi2", 1, 1, 1)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            rubric_assignment_id: 1,
            type_question: "mc"
        });
    });

    /**
     * Test to update a mc option
     */
    it("update mc option", async () => {
        expect(await RubricPS.executeUpdateMCOption("hi2", 1, 1)).to.deep.equal({
            id: 1,
            option: "hi2",
            mcquestion_id: 1
        });
    });

    /**
     * Test to get all mc questions by an id
     */
    it("get mc question", async () => {
        expect(await RubricPS.executeGetAllMCQuestionById(1)).to.deep.equal([{
            id: 1,
            question: "What is the best way to insert queries?",
            question_number: 3,
            rubric_assignment_id: 1,
            type_question: "mc"
        }]);
    });

    /**
     * Test to get all open questions by an id
     */
    it("get open question", async () => {
        expect(await RubricPS.executeGetAllOpenQuestionById(1)).to.deep.equal([{
            id: 1,
            question: "How to insert queries?",
            question_number: 1,
            rubric_assignment_id: 1,
            type_question: "open"
        }]);
    });

    /**
     * Test to get all range questions by an id
     */
    it("get range question", async () => {
        expect(await RubricPS.executeGetAllRangeQuestionById(1)).to.deep.equal([{
            id: 1,
            question: "How much fun is inserting queries?",
            range: 7,
            question_number: 2,
            rubric_assignment_id: 1,
            type_question: "range"
        }]);
    });

    /**
     * Test to get all mc option by an id
     */
    it("get mc option", async () => {
        expect(await RubricPS.executeGetAllMCOptionById(1)).to.deep.equal([{
            id: 1,
            mcquestion_id: 1,
            option: "By using pgAdmin"
        },
            {
                id: 2,
                mcquestion_id: 1,
                option: "By using command line"
            },
            {
                id: 3,
                mcquestion_id: 1,
                option: "By asking Brian"
            }]);
    });

    /**
     * Test to delete a rubric
     */
    it("delete rubric", async () => {
        expect(await RubricPS.executeDeleteRubric(1)).to.deep.equal({
            assignment_id: 1
        });
    });

    /**
     * Test to delete a open question
     */
    it("delete open question", async () => {
        expect(await RubricPS.executeDeleteOpenQuestion(1)).to.deep.equal({
            rubric_assignment_id: 1,
            id: 1,
            question: "How to insert queries?",
            question_number: 1,
            type_question: "open"
        });
    });

    /**
     * Test to delete a range question
     */
    it("delete range question", async () => {
        expect(await RubricPS.executeDeleteRangeQuestion(1)).to.deep.equal({
            rubric_assignment_id: 1,
            id: 1,
            question: "How much fun is inserting queries?",
            question_number: 2,
            range: 7,
            type_question: "range"
        });
    });

    /**
     * Test to delete a mc question
     */
    it("delete mc question", async () => {
        expect(await RubricPS.executeDeleteMCQuestion(1)).to.deep.equal({
            rubric_assignment_id: 1,
            id: 1,
            question: "What is the best way to insert queries?",
            question_number: 3,
            type_question: "mc"
        });
    });

    /**
     * Test to delete a mc option
     */
    it("delete mc option", async () => {
        expect(await RubricPS.executeDeleteMCOption(1)).to.deep.equal({
            id: 1,
            mcquestion_id: 1,
            option: "By using pgAdmin"
        });
    });

    /**
     * Test get whole rubric
     */
    it("get whole rubric", async () => {
        expect(await RubricPS.getAllQuestionsByRubricId(1)).to.deep.equal([
                {
                    "id": 1,
                    "option": [
                        {
                            "id": 1,
                            "mcquestion_id": 1,
                            "option": "By using pgAdmin"
                        },
                        {
                            "id": 2,
                            "mcquestion_id": 1,
                            "option": "By using command line"
                        },
                        {
                            "id": 3,
                            "mcquestion_id": 1,
                            "option": "By asking Brian"
                        }
                    ],
                    "question": "What is the best way to insert queries?",
                    "question_number": 3,
                    "type_question": "mc",
                },
                {
                    "id": 1,
                    "question": "How to insert queries?",
                    "question_number": 1,
                    "rubric_assignment_id": 1,
                    "type_question": "open"
                },
                {
                    "id": 1,
                    "question": "How much fun is inserting queries?",
                    "question_number": 2,
                    "range": 7,
                    "rubric_assignment_id": 1,
                    "type_question": "range"
                }
            ]
        );
    });

});