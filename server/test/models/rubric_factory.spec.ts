import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import RubricPS from "../../src/prepared_statements/rubric_ps";
import { generateRubric, RubricConfiguration } from "../../src/models/rubric_factory";
import rubricConfig from "../../src/rubricConfig";
import AssignmentPS from "../../src/prepared_statements/assignment_ps";

describe("RubricPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Test to create a rubric with open, range and multiple choice questions
     */
    it("Create rubric using a config", async () => {
        const openQuestion = "This is an open question";
        const rangeQuestion = "This is a range question";
        const range = 5;
        const mcQuestion = "This is a mc question";
        const options = ["1", "2"];

        const config: RubricConfiguration = {
            rubric_type: "submission",
            questions: [
                {
                    question: openQuestion
                },
                {
                    question: rangeQuestion,
                    range
                },
                {
                    question: mcQuestion,
                    options
                }
            ]
        };

        const assignment: any = await AssignmentPS.executeAddAssignment(
            "TestAssignment 1",
            "Description",
            1, 1,
            "filename",
            new Date("2016-05-01T20:30:00.000Z"),
            new Date("2017-05-01T21:30:00.000Z"),
            new Date("2018-05-01T22:30:00.000Z"),
            new Date("2019-05-01T23:30:00.000Z"),
            false,
            false);

        const rubric: any = await generateRubric(config, assignment.id);
        const questions: any = await RubricPS.getAllQuestionsByRubricId(rubric.id);

        const openQuestions: any = await RubricPS.executeGetAllOpenQuestionById(rubric.id);
        const rangeQuestions: any = await RubricPS.executeGetAllRangeQuestionById(rubric.id);
        const mcQuestions: any = await RubricPS.executeGetAllMCQuestionById(rubric.id);

        expect(questions.length).to.equal(3);
        expect(openQuestions.length).to.equal(1);
        expect(rangeQuestions.length).to.equal(1);
        expect(mcQuestions.length).to.equal(1);

        const mcOptions: any = await RubricPS.executeGetAllMCOptionById(mcQuestions[0].id);

        expect({
            question: openQuestions[0].question,
            rubric_id: openQuestions[0].rubric_id,
            question_number: openQuestions[0].question_number
        }).to.deep.equal({
            question: openQuestion,
            rubric_id: rubric.id,
            question_number: 1  // Because the open question is the first item in the config
        });

        expect({
            question: rangeQuestions[0].question,
            range: rangeQuestions[0].range,
            rubric_id: rangeQuestions[0].rubric_id,
            question_number: rangeQuestions[0].question_number
        }).to.deep.equal({
            question: rangeQuestion,
            range,
            rubric_id: rubric.id,
            question_number: 2
        });

        expect({
            question: mcQuestions[0].question,
            rubric_id: mcQuestions[0].rubric_id,
            question_number: mcQuestions[0].question_number
        }).to.deep.equal({
            question: mcQuestion,
            rubric_id: rubric.id,
            question_number: 3
        });

        expect(mcOptions.length).to.equal(2);

        expect(mcOptions[0]).to.deep.include({ option: "1" });
        expect(mcOptions[1]).to.deep.include({ option: "2" });
    });
});