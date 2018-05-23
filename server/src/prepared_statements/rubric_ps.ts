import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class rubricPS {
    private static createRubric: PreparedStatement = new PreparedStatement("create-rubric",
        'INSERT INTO "rubric" ("assignment_id") VALUES ($1) RETURNING *');

    private static getRubricById: PreparedStatement = new PreparedStatement("get-rubric-by-id",
        'SELECT * FROM rubric WHERE assignment_id=$1');

    private static createOpenQuestion: PreparedStatement = new PreparedStatement("make-open-question",
        'INSERT INTO openquestion (question, rubric_assignment_id, question_number VALUES ($1, $2, $3) RETURNING *');

    private static createMCQuestion: PreparedStatement = new PreparedStatement("make-MC-question",
        'INSERT INTO mcquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *');

    private static createRangeQuestion: PreparedStatement = new PreparedStatement("make-range-question",
        'INSERT INTO rangequestion (question, range, rubric_assignment_id, question_number) VALUES ($1, $2, $3, $4) RETURNING *');

    private static createMCOption: PreparedStatement = new PreparedStatement("make-MC-option",
        'INSERT INTO mcoption (option, mcquestion_id) VALUES ($1, $2) RETURNING *');

    private static updateOpenQuestion: PreparedStatement = new PreparedStatement("update-open-question",
        'UPDATE openquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) WHERE id = $4 RETURNING *');

    private static updateRangeQuestion: PreparedStatement = new PreparedStatement("update-range-question",
        'UPDATE rangequestion SET (question, range, rubric_assignment_id, question_number) = ($1, $2, $3, $4) WHERE id = $5 RETURNING *');

    private static updateMCQuestion: PreparedStatement = new PreparedStatement("update-mc-question",
        'UPDATE mcquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) RETURNING *');

    private static updateMCOption: PreparedStatement = new PreparedStatement("updat-mc-option",
        'UPDATE mcoption SET (option, mcquestion_id) = ($1, $2, $3) WHERE id = $4 RETURNING *');

    private static getAllMCQuestionById: PreparedStatement = new PreparedStatement("get-all-MC-questions",
        'SELECT * FROM mcquestion WHERE rubric_assignment_id = $1');

    private static getAllOpenQuestionById: PreparedStatement = new PreparedStatement("get-all-openquestions",
        'SELECT * FROM openquestion WHERE rubric_assignment_id = $1');

    private static getAllRangeQuestionById: PreparedStatement = new PreparedStatement("get-all-rangequestion",
        'SELECT * FROM rangequestion WHERE rubric_assignment_id = $1');

    private static getAllMCOptionById: PreparedStatement = new PreparedStatement("get-all-options",
        'SELECT * FROM mcoption WHERE mcquestion_id = $1');


    /**
     * executes 'create MC option' query
     * @param {string} option - option
     * @param {number} mcquestion_id - mcquestion_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCOption(option: string, mcquestion_id: number): Promise<pgPromise.queryResult> {
        this.createMCOption.values = [option, mcquestion_id];
        return Database.executeQuerySingleResult(this.createMCOption);
    }

    /**
     * executes 'create range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRangeQuestion(question: string, range: number, rubric_assignment_id: number, question_number: number): Promise<pgPromise.queryResult>{
        this.createRangeQuestion.values = [question, range, rubric_assignment_id, question_number];
        return Database.executeQuerySingleResult(this.createRangeQuestion);
    }

    /**
     * executes 'create mc question' query
     * @param {string} question - question
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCQuestion(question: string, rubric_assignment_id: number, question_number: number): Promise<pgPromise.queryResult> {
        this.createMCQuestion.values = [question, rubric_assignment_id, question_number];
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




}