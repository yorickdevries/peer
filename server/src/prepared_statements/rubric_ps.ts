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

    private static createMPQuestion: PreparedStatement = new PreparedStatement("make-MPC-question",
        'INSERT INTO mcquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *');

    private static createRangeQuestion: PreparedStatement = new PreparedStatement("make-range-question",
        'INSERT INTO rangequestion (question, range, rubric_assignment_id, question_number) VALUES ($1, $2, $3, $4) RETURNING *');

    private static createMCOption: PreparedStatement = new PreparedStatement("make-MC-option",
        'INSERT INTO mcoption (option, mcquestion_id) VALUES ($1, $2) RETURNING *');

    private static updateOpenQuestion: PreparedStatement = new PreparedStatement("update-open-question",
        'UPDATE openquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) WHERE id = $4');

    private static updateRangeQuestion: PreparedStatement = new PreparedStatement("update-range-question",
        'UPDATE rangequestion SET (question, range, rubric_assignment_id, question_number) = ($1, $2, $3, $4) WHERE id = $5');

    private static updateMCQuestion: PreparedStatement = new PreparedStatement("update-mc-question",
        'UPDATE mcquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) RETURNING *');

    private static updateMCOption: PreparedStatement = new PreparedStatement("updat-mc-option",
        'UPDATE mcoption SET (option, mcquestion_id) = ($1, $2, $3) WHERE id = $4');

    private static getAllMCQuestionById: PreparedStatement = new PreparedStatement("get-all-MC-questions",
        'SELECT * FROM mcquestion WHERE rubric_assignment_id = $1');

    private static getAllOpenQuestionById: PreparedStatement = new PreparedStatement("get-all-openquestions",
        'SELECT * FROM openquestion WHERE rubric_assignment_id = $1');

    private static getAllRangeQuestionById: PreparedStatement = new PreparedStatement("get-all-rangequestion",
        'SELECT * FROM rangequestion WHERE rubric_assignment_id = $1');




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