import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for review
 */
export default class ReviewPS {

    /**
     * Creates a review
     *
     * @static
     * @param {string} comment
     * @param {string} userNetId
     * @param {number} submissionId
     * @param {number} rubricAssignmentId
     * @returns {Promise<pgPromise.queryResult>}
     * @memberof ReviewPS
     */
    public static executeCreateReview(comment: string, userNetId: string, submissionId: number, rubricAssignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("create-review",
        "INSERT INTO review(comment, user_netid, submission_id, rubric_assignment_id) VALUES ($1, $2, $3, $4) RETURNING *");
        statement.values = [comment, userNetId, submissionId, rubricAssignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get review' query, where all reviews are fetched.
     * Additionally, the file_path is fetched from the corresponding submission table.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a result, containing tuples following the API documentation.
     */
    public static executeGetReview(reviewId: number): any {
        const statement = new PreparedStatement("get-review-by-id",
            "SELECT review.id, rubric_assignment_id, file_path, comment, done " +
            "FROM review JOIN submission ON submission.id = review.submission_id " +
            "WHERE review.id = $1");
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all reviews made by a certain user for a certain assignment
     *
     * @static
     * @param {string} userNetId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     * @memberof ReviewPS
     */
    public static executeGetReviewsByUserIdAndAssignmentId(userNetId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-reviews-by-user-id-and-assignment-id",
        "SELECT * FROM review WHERE user_netid = $1 AND rubric_assignment_id = $2");
        statement.values = [userNetId, assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Execute a 'submit review' query, where the done field is set to true.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeSubmitReview(reviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("submit-review",
            "UPDATE review " +
            "SET done=true " +
            "WHERE id = $1" +
            "RETURNING *");
        statement.values = [reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Execute an 'add mpc answer' query.
     * @param {number} answerOption - a 1 char answer.
     * @param {number} questionId - a question id.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateMpcAnswer(answerOption: number, questionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        const statement =  new PreparedStatement("add-mpc-answer",
            "INSERT INTO mcanswer(answer, mcquestion_id, review_id) VALUES ($1, $2, $3) ON CONFLICT (mcquestion_id, review_id) " +
            "DO UPDATE SET answer=$1 RETURNING answer");
        statement.values = [answerOption, questionId, reviewId];
        return Database.executeQuerySingleResult(statement);
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
        const statement = new PreparedStatement("add-open-answer",
            "INSERT INTO openanswer(answer, openquestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (openquestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer");
        statement.values = [answer, questionId, reviewId];
        return Database.executeQuerySingleResult(statement);
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
        const statement = new PreparedStatement("add-range-answer",
            "INSERT INTO rangeanswer(answer, rangequestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (rangequestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer");
        statement.values = [answer, questionId, reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get mc answer by review id' query.
     * @param {number} reviewId - a review id.
     * @param {number} mcQuestionId - a mc question id.
     * @return {Promise<pgPromise.queryResult>} - a promise query result.
     */
    public static executeGetMCAnswer(reviewId: number, mcQuestionId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-mc-answer-by-id",
            "SELECT * FROM mcanswer WHERE review_id = $1 AND mcquestion_id = $2");
        statement.values = [reviewId, mcQuestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get mc answer by review id' query.
     * @param {number} reviewId - a review id.
     * @param {number} rangeQuestionId - a range question id.
     * @return {Promise<pgPromise.queryResult>} - a promise query result.
     */
    public static executeGetRangeAnswer(reviewId: number, rangeQuestionId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-range-answer-by-id",
            "SELECT * FROM rangeanswer WHERE review_id = $1 AND rangequestion_id = $2");
        statement.values = [reviewId, rangeQuestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get mc answer by review id' query.
     * @param {number} reviewId - a review id.
     * @param {number} openQuestionId - a open question id.
     * @return {Promise<pgPromise.queryResult>} - a promise query result.
     */
    public static executeGetOpenAnswer(reviewId: number, openQuestionId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-open-answer-by-id",
            "SELECT * FROM openanswer WHERE review_id = $1 AND openquestion_id = $2");
        statement.values = [reviewId, openQuestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all reviews made by a certain group for a certain assignment
     *
     * @static
     * @param {string} userNetId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     * @memberof ReviewPS
     */
    public static executeGetReviewsByGroupIdAndAssignmentId(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-reviews-by-group-id-and-assignment-id",
            "SELECT id FROM review WHERE submission_id = $1");
        statement.values = [submissionId];
        return Database.executeQuery(statement);
    }
}