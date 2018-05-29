import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class RubricPS {
    private static createRubric: PreparedStatement = new PreparedStatement("create-rubric",
        'INSERT INTO "rubric" ("assignment_id") VALUES ($1) RETURNING *');

    private static createOpenQuestion: PreparedStatement = new PreparedStatement("make-open-question",
        "INSERT INTO openquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *");

    private static createMCQuestion: PreparedStatement = new PreparedStatement("make-MC-question",
        "INSERT INTO mcquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *");

    private static createRangeQuestion: PreparedStatement = new PreparedStatement("make-range-question",
        "INSERT INTO rangequestion (question, range, rubric_assignment_id, question_number) VALUES ($1, $2, $3, $4) RETURNING *");

    private static createMCOption: PreparedStatement = new PreparedStatement("make-MC-option",
        "INSERT INTO mcoption (option, mcquestion_id) VALUES ($1, $2) RETURNING *");

    private static updateOpenQuestion: PreparedStatement = new PreparedStatement("update-open-question",
        "UPDATE openquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) WHERE id = $4 RETURNING *");

    private static updateRangeQuestion: PreparedStatement = new PreparedStatement("update-range-question",
        "UPDATE rangequestion SET (question, range, rubric_assignment_id, question_number) = ($1, $2, $3, $4) WHERE id = $5 RETURNING *");

    private static updateMCQuestion: PreparedStatement = new PreparedStatement("update-mc-question",
        "UPDATE mcquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) WHERE id = $4 RETURNING *");

    private static updateMCOption: PreparedStatement = new PreparedStatement("updat-mc-option",
        "UPDATE mcoption SET (option, mcquestion_id) = ($1, $2) WHERE id = $3 RETURNING *");

    private static getAllMCQuestionById: PreparedStatement = new PreparedStatement("get-all-MC-questions",
        "SELECT * FROM mcquestion WHERE rubric_assignment_id = $1");

    private static getAllOpenQuestionById: PreparedStatement = new PreparedStatement("get-all-openquestions",
        "SELECT * FROM openquestion WHERE rubric_assignment_id = $1");

    private static getAllRangeQuestionById: PreparedStatement = new PreparedStatement("get-all-rangequestion",
        "SELECT * FROM rangequestion WHERE rubric_assignment_id = $1");

    private static getAllMCOptionById: PreparedStatement = new PreparedStatement("get-all-options",
        "SELECT * FROM mcoption WHERE mcquestion_id = $1");

    private static deleteMCOption: PreparedStatement = new PreparedStatement("delte-mc-option",
        "DELETE FROM mcoption WHERE id=$1 RETURNING *");

    private static deleteMCQuestion: PreparedStatement = new PreparedStatement("delete-mc-question",
        "DELETE FROM mcquestion WHERE id=$1 RETURNING *");

    private static deleteOpenQuestion: PreparedStatement = new PreparedStatement("delete-open-question",
        "DELETE FROM openquestion WHERE id=$1 RETURNING *");

    private static deleteRangeQuestion: PreparedStatement = new PreparedStatement("delete-range-question",
        "DELETE FROM rangequestion WHERE id=$1 RETURNING *");

    private static deleteRubric: PreparedStatement = new PreparedStatement("delete-rubric",
        "DELETE FROM rubric WHERE assignment_id=$1 RETURNING *");


    /**
     * Query 'delete rubric'
     * @param {number} id - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteRubric(id: number): Promise<pgPromise.queryResult> {
        this.deleteRubric.values = [id];
        return Database.executeQuerySingleResult(this.deleteRubric);
    }

    /**
     * Query 'delete mc option'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteMCOption(id: number): Promise<pgPromise.queryResult> {
        this.deleteMCOption.values = [id];
        return Database.executeQuerySingleResult(this.deleteMCOption);
    }

    /**
     * Query 'delete MC question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteMCQuestion(id: number): Promise<pgPromise.queryResult> {
        this.deleteMCQuestion.values = [id];
        return Database.executeQuerySingleResult(this.deleteMCQuestion);
    }

    /**
     * Query 'delete open question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteOpenQuestion(id: number): Promise<pgPromise.queryResult> {
        this.deleteOpenQuestion.values = [id];
        return Database.executeQuerySingleResult(this.deleteOpenQuestion);
    }

    /**
     * Query 'delte range qustion'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteRangeQuestion(id: number): Promise<pgPromise.queryResult> {
        this.deleteRangeQuestion.values = [id];
        return Database.executeQuerySingleResult(this.deleteRangeQuestion);
    }

    /**
     * executes 'update mc option' query
     * @param {string} option
     * @param {number} mcquestionId
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateMCOption(option: string, mcquestionId: number, id: number): Promise<pgPromise.queryResult> {
        this.updateMCOption.values = [option, mcquestionId, id];
        return Database.executeQuerySingleResult(this.updateMCOption);
    }

    /**
     * executes 'update mc question' query
     * @param {string} question - question
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateMCQuestion(question: string, rubricAssignmentId: number, questionNumber: number, id: number): Promise<pgPromise.queryResult> {
        this.updateMCQuestion.values = [question, rubricAssignmentId, questionNumber, id];
        return Database.executeQuerySingleResult(this.updateMCQuestion);
    }

    /**
     * executes 'update range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateRangeQuestion(question: string, range: number, rubricAssignmentId: number, questionNumber: number, id: number): Promise<pgPromise.queryResult> {
        this.updateRangeQuestion.values = [question, range, rubricAssignmentId, questionNumber, id];
        return Database.executeQuerySingleResult(this.updateRangeQuestion);
    }

    /**
     * executes 'update open question' query
     * @param {string} question - question
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateOpenQuestion(question: string, rubricAssignmentId: number, questionNumber: number, id: number): Promise<pgPromise.queryResult> {
        this.updateOpenQuestion.values = [question, rubricAssignmentId, questionNumber, id];
        return Database.executeQuerySingleResult(this.updateOpenQuestion);
    }

    /**
     * executes 'create MC option' query
     * @param {string} option - option
     * @param {number} mcquestionId - mcquestion_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCOption(option: string, mcquestionId: number): Promise<pgPromise.queryResult> {
        this.createMCOption.values = [option, mcquestionId];
        return Database.executeQuerySingleResult(this.createMCOption);
    }

    /**
     * executes 'create range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRangeQuestion(question: string, range: number, rubricAssignmentId: number, questionNumber: number): Promise<pgPromise.queryResult> {
        this.createRangeQuestion.values = [question, range, rubricAssignmentId, questionNumber];
        return Database.executeQuerySingleResult(this.createRangeQuestion);
    }

    /**
     * executes 'create mc question' query
     * @param {string} question - question
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCQuestion(question: string, rubricAssignmentId: number, questionNumber: number): Promise<pgPromise.queryResult> {
        this.createMCQuestion.values = [question, rubricAssignmentId, questionNumber];
        return Database.executeQuerySingleResult(this.createMCQuestion);
    }

    /**
     * executes 'create open question' query
     * @param {string} question - question
     * @param {number} assignmentId - assignment_id
     * @param {number} questionNr - questino_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateOpenQuestion(question: string, assignmentId: number, questionNr: number): Promise<pgPromise.queryResult> {
        this.createOpenQuestion.values = [question, assignmentId, questionNr];
        return Database.executeQuerySingleResult(this.createOpenQuestion);
    }

    /**
     * executes 'create rubric' query
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRubric(assignmentId: number): Promise<pgPromise.queryResult> {
        this.createRubric.values = [assignmentId];
        return Database.executeQuerySingleResult(this.createRubric);
    }

    /**
     * executes 'get rubric by id' query
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetRubricById(assignmentId: number): Promise<pgPromise.queryResult> {
        this.getRubricById.values = [assignmentId];
        return Database.executeQuerySingleResult(this.getRubricById);
    }

    /**
     * executes 'get all options by id' query
     * @param {number} id - mcquestion_id
     * @returns {any}
     */
    public static executeGetAllMCOptionById(id: number): any {
        this.getAllMCOptionById.values = [id];
        return Database.executeQuery(this.getAllMCOptionById);
    }

    /**
     * executes 'get all range questions' query
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllRangeQuestionById(id: number): any {
        this.getAllRangeQuestionById.values = [id];
        return Database.executeQuery(this.getAllRangeQuestionById);
    }

    /**
     * executes 'get all open questions' query
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllOpenQuestionById(id: number): any {
        this.getAllOpenQuestionById.values = [id];
        return Database.executeQuery(this.getAllOpenQuestionById);
    }

    /**
     * executes 'get all MC questions' qeury
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllMCQuestionById(id: number): any {
        this.getAllMCQuestionById.values = [id];
        return Database.executeQuery(this.getAllMCQuestionById);
    }

    /**
     * Funtion that creates the rubric of all questions
     * @param {number} rubricId - rubric_id
     * @returns {Promise<any[]>}
     */
    public static async getAllQuestionsByRubricId(rubricId: number) {
        const mcQuestions = await RubricPS.executeGetAllMCQuestionById(rubricId);
        const openQuestions = await RubricPS.executeGetAllOpenQuestionById(rubricId);
        const rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(rubricId);
        const questionJson: any[] = [];


        for (let i = 0; i < mcQuestions.length; i++) {
            questionJson.push({
                id: mcQuestions[i].id,
                type_question: mcQuestions[i].type_question,
                question: mcQuestions[i].question,
                question_number: mcQuestions[i].question_number,
                option: await RubricPS.executeGetAllMCOptionById(mcQuestions[i].id)
        });
        }

        for (let i = 0; i < openQuestions.length; i++) {
            questionJson.push(openQuestions[i]);
        }
        for (let i = 0; i < rangeQuestions.length; i++) {
            questionJson.push(rangeQuestions[i]);
        }

        return questionJson;
    }

}