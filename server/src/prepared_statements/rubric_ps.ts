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

    /**
     * executes 'create open question' query
     * @param {string} question - question
     * @param {number} assignmentId - assignment_id
     * @param {number} questionNr - question_number
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