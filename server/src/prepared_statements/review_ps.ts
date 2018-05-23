import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class ReviewPS {
    private static getReview: PreparedStatement = new PreparedStatement("get-review",
        "SELECT review.id, rubric_assignment_id, file_path, comment, done " +
        "FROM review JOIN submission ON submission.id = review.submission_id " +
        "WHERE review.id = $1");

    private static submitReview: PreparedStatement = new PreparedStatement("submit-review",
        "﻿UPDATE review " +
        "SET done=true " +
        "WHERE id = $1" +
        "RETURNING *");

    private static updateMpcAnswer: PreparedStatement = new PreparedStatement("add-mpc-answer",
        "INSERT INTO mcanswer(answer_option, mcquestion_id, review_id) VALUES ($1, $2, $3) " +
        "ON CONFLICT (mcquestion_id, review_id) DO UPDATE SET answer_option=$1﻿RETURNING answer_option");

    private static updateOpenAnswer: PreparedStatement = new PreparedStatement("add-open-answer",
        "INSERT INTO openanswer(answer, openquestion_id, review_id) VALUES ($1, $2, $3) " +
        "ON CONFLICT (openquestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer");

    private static updateRangeAnswer: PreparedStatement = new PreparedStatement("add-range-answer",
        "﻿INSERT INTO rangeanswer(answer, rangequestion_id, review_id) VALUES ($1, $2, $3) " +
        "ON CONFLICT (rangequestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer");


    /**
     * Execute a 'get review' query, where all reviews are fetched.
     * Additionally, the file_path is fetched from the corresponding submission table.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a result, containing tuples following the API documentation.
     */
    public static executeGetReview(reviewId: number): Promise<pgPromise.queryResult> {
        this.getReview.values = [reviewId];
        return Database.executeQuery(this.getReview);
    }

    /**
     * Execute a 'submit review' query, where the done field is set to true.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeSubmitReview(reviewId: number): Promise<pgPromise.queryResult> {
        this.submitReview.values = [reviewId];
        return Database.executeQuery(this.submitReview);
    }

    /**
     * Execute an 'add mpc answer' query.
     * @param {number} answer_option - a 1 char answer.
     * @param {number} questionId - a question id.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateMpcAnswer(answer_option: number, questionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        this.updateMpcAnswer.values = [answer_option, questionId, reviewId];
        return Database.executeQuery(this.updateMpcAnswer);
    }

    /**
     * Execute an 'add open answer' query.
     * @param {number} answer - an open answer string.
     * @param {number} questionId - a question id.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateOpenAnswer(answer: string, questionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        this.updateOpenAnswer.values = [answer, questionId, reviewId];
        return Database.executeQuery(this.updateOpenAnswer);
    }

    /**
     * Execute an 'update range answer' query.
     * @param {number} answer - a range answer.
     * @param {number} questionId - a question id.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateRangeAnswer(answer: number, questionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        this.updateRangeAnswer.values = [answer, questionId, reviewId];
        return Database.executeQuery(this.updateRangeAnswer);
    }
}