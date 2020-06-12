import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import RubricPS from "../../../src/old_api/prepared_statements/rubric_ps";

describe("RubricPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Test to create a rubric
     */
    it("create rubric", async () => {
        expect(await RubricPS.executeCreateRubric(3, "submission")).to.deep.equal({
            assignment_id: 3,
            id: 3,
            type: "submission"
        });
    });

    /**
     * Test to create open question
     */
    it("create open question", async () => {
        expect(await RubricPS.executeCreateOpenQuestion("hi", 1, 1, false)).to.deep.equal({
            id: 3,
            question: "hi",
            question_number: 1,
            rubric_id: 1,
            optional: false
        });
    });

    /**
     * Test to create mc question
     */
    it("create mc question", async () => {
        expect(await RubricPS.executeCreateMCQuestion("hi", 1, 1, false)).to.deep.equal({
            id: 3,
            question: "hi",
            question_number: 1,
            rubric_id: 1,
            optional: false
        });
    });

    /**
     * Test to create open question
     */
    it("create range question", async () => {
        expect(await RubricPS.executeCreateRangeQuestion("hi", 6, 1, 1, false)).to.deep.equal({
            id: 2,
            question: "hi",
            question_number: 1,
            rubric_id: 1,
            range: 6,
            optional: false
        });
    });

    /**
     * Test to create mc option
     */
    it("create mc option", async () => {
        expect(await RubricPS.executeCreateMCOption("hi", 1)).to.deep.equal({
            id: 5,
            mcquestion_id: 1,
            option: "hi"
        });
    });


    /**
     * Test to create an upload question
     */
    it("create upload question", async () => {
        const question = "upload your file";
        const assignmentId = 1;
        const questionNr = 12;
        const extension = "pdf";

        // Create upload question
        const created: any = await RubricPS.executeCreateUploadQuestion(question, assignmentId, questionNr, extension, false);

        // Get upload question
        const fetched = await RubricPS.executeGetUploadQuestionByIdAndRubricId(created.id, assignmentId);

        // Verify results
        expect({
            question: fetched.question,
            assignmentId: fetched.id,
            questionNr: fetched.question_number,
            extension: fetched.extension
        }).to.deep.equal({
            question,
            assignmentId,
            questionNr,
            extension
        });
    });

    /**
     * Test to update an upload question
     */
    it("update upload question", async () => {
        const question = "upload your file!";
        const questionNr = 5;
        const extension = "zip";

        // Create upload question
        const created: any = await RubricPS.executeCreateUploadQuestion("", 2, 4, "not", false);

        // Update question
        const updated: any = await RubricPS.executeUpdateUploadQuestion(question, questionNr, created.id, extension, false);

        // Verify results
        expect({
            question: updated.question,
            id: updated.id,
            questionNr: updated.question_number,
            extension: updated.extension
        }).to.deep.equal({
            question,
            id: created.id,
            questionNr,
            extension
        });
    });

    /**
     * Test to update an open question
     */
    it("update open question", async () => {
        expect(await RubricPS.executeUpdateOpenQuestion("hi2", 1, 1, false)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            rubric_id: 1,
            optional: false
        });
    });

    /**
     * Test to update an range question
     */
    it("update range question", async () => {
        expect(await RubricPS.executeUpdateRangeQuestion("hi2", 6, 1, 1, false)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            range: 6,
            rubric_id: 1,
            optional: false
        });
    });

    /**
     * Test to update a mc question
     */
    it("update mc question", async () => {
        expect(await RubricPS.executeUpdateMCQuestion("hi2", 1, 1, false)).to.deep.equal({
            id: 1,
            question: "hi2",
            question_number: 1,
            rubric_id: 1,
            optional: false
        });
    });

    /**
     * Test to update a mc option
     */
    it("update mc option", async () => {
        expect(await RubricPS.executeUpdateMCOption("hi2", 1)).to.deep.equal({
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
            rubric_id: 1,
            optional: false
        },
        {
            id: 2,
            question: "Is the right Answer A?",
            question_number: 4,
            rubric_id: 1,
            optional: false
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
            rubric_id: 1,
            optional: false
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
            rubric_id: 1,
            optional: false
        }]);
    });

    /**
     * Test to get all mc option by an id
     */
    it("get mc option", async () => {
        expect(await RubricPS.executeGetAllMCOptionById(1)).to.deep.equal([
            {
                id: 3,
                mcquestion_id: 1,
                option: "By asking Brian"
            },
            {
                id: 2,
                mcquestion_id: 1,
                option: "By using command line"
            },
            {
                id: 1,
                mcquestion_id: 1,
                option: "By using pgAdmin"
            }
        ]);
    });

    /**
     * Test to delete a open question
     */
    it("delete open question", async () => {
        const newq: any = await RubricPS.executeCreateOpenQuestion("New Question", 1, 5, false);
        expect(await RubricPS.executeDeleteOpenQuestion(newq.id)).to.deep.equal({
            rubric_id: 1,
            id: newq.id,
            question: "New Question",
            question_number: 5,
            optional: false
        });
    });

    /**
     * Test to delete a range question
     */
    it("delete range question", async () => {
        const newq: any = await RubricPS.executeCreateRangeQuestion("New Question", 5, 1, 5, false);
        expect(await RubricPS.executeDeleteRangeQuestion(newq.id)).to.deep.equal({
            rubric_id: 1,
            id: newq.id,
            question: "New Question",
            question_number: 5,
            range: 5,
            optional: false
        });
    });

    /**
     * Test to delete a mc question
     */
    it("delete mc question", async () => {
        // delete the option associated with it
        await RubricPS.executeDeleteMCOption(4);
        expect(await RubricPS.executeDeleteMCQuestion(2)).to.deep.equal({
            rubric_id: 1,
            id: 2,
            question: "Is the right Answer A?",
            question_number: 4,
            optional: false
        });
    });

    /**
     * Test to delete a mc option
     */
    it("delete mc option", async () => {
        expect(await RubricPS.executeDeleteMCOption(2)).to.deep.equal({
            id: 2,
            mcquestion_id: 1,
            option: "By using command line"
        });
    });

    /**
     * Test to delete a upload question
     */
    it("delete upload question", async () => {
        const question = "upload your file";
        const assignmentId = 1;
        const questionNr = 12;
        const extension = "pdf";

        // Create upload question
        const created: any = await RubricPS.executeCreateUploadQuestion(question, assignmentId, questionNr, extension, false);

        // Get upload question
        const fetched = await RubricPS.executeGetUploadQuestionByIdAndRubricId(created.id, created.rubric_id);

        // Delete question
        const deleted = await RubricPS.executeDeleteUploadQuestion(created.id);

        // Verify
        expect(fetched).to.deep.equal(deleted);
    });

    /**
     * Test get whole rubric includes upload questions
     */
    it("get whole rubric includes", async () => {
        const assignmentId = 1;
        const created: any = await RubricPS.executeCreateUploadQuestion("question", assignmentId, 12, "pdf", false);
        const fetched: any = await RubricPS.getAllQuestionsByRubricId(assignmentId);

        expect(fetched).to.deep.include({
            ...created,
            type_question: "upload"
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
                            id: 3,
                            mcquestion_id: 1,
                            option: "By asking Brian"
                        },
                        {
                            id: 2,
                            mcquestion_id: 1,
                            option: "By using command line"
                        },
                        {
                            id: 1,
                            mcquestion_id: 1,
                            option: "By using pgAdmin"
                        }
                    ],
                    "question": "What is the best way to insert queries?",
                    "question_number": 3,
                    "rubric_id": 1,
                    "type_question": "mc",
                    optional: false
                },
                {
                    "id": 2,
                    "option": [
                    {
                      "id": 4,
                      "mcquestion_id": 2,
                      "option": "A",
                    }
                    ],
                    "question": "Is the right Answer A?",
                    "question_number": 4,
                    "rubric_id": 1,
                    "type_question": "mc",
                    optional: false
                },
                {
                    "id": 1,
                    "question": "How to insert queries?",
                    "question_number": 1,
                    "rubric_id": 1,
                    "type_question": "open",
                    optional: false
                },
                {
                    "id": 1,
                    "question": "How much fun is inserting queries?",
                    "question_number": 2,
                    "range": 7,
                    "rubric_id": 1,
                    "type_question": "range",
                    optional: false
                }
            ]
        );
    });

});