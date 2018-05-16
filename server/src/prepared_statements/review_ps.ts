import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class ReviewPS {
    private static createReview: PreparedStatement = new PreparedStatement("created-review",
        "INSERT INTO review (comment, user_netid, submission_id, rubric_assignment_id) VALUES ($1, $2, $3, $4)" +
        " RETURNING comment, user_netid, submission_id, rubric_assignment_id");


    /**
     * Executes 'create review'query
     * @param {string} comment
     * @param {string} user_netid
     * @param {number} submission_id
     * @param {number} rubric_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateReview(comment: string, user_netid: string, submission_id: number, rubric_id: number)
        : Promise<pgPromise.queryResult> {
        this.createReview.values = [comment, user_netid, submission_id, rubric_id];
        return Database.executeQuery(this.createReview);
    }
}