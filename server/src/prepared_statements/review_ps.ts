import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for review
 */
export default class ReviewPS {

    /**
     * Creates a review.
     * @param {string} userNetId - net id of the user.
     * @param {number} submissionId - submission id related to the review.
     * @param {number} rubricAssignmentId - assignment id.
     * @returns {Promise<pgPromise.queryResult>} created review as pg promise.
     */
    public static executeCreateReview(userNetId: string, submissionId: number, rubricAssignmentId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("create-review",
        "INSERT INTO review(user_netid, submission_id, rubric_assignment_id) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [userNetId, submissionId, rubricAssignmentId];
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
            "SELECT review.id, rubric_assignment_id, file_path, done, approved " +
            "FROM review JOIN submission ON submission.id = review.submission_id " +
            "WHERE review.id = $1");
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all reviews made by a certain user for a certain assignment
     * @param {string} userNetId - net id of the user.
     * @param {number} assignmentId - assignment id.
     * @returns {Promise<pgPromise.queryResult>} - all reviews as pg promise.
     */
    public static executeGetReviewsByUserIdAndAssignmentId(userNetId: string, assignmentId: number)
        : Promise<pgPromise.queryResult> {
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
    public static executeSubmitReview(reviewId: number) {
        const statement = new PreparedStatement("submit-review",
            "UPDATE review SET done=true WHERE id = $1 RETURNING *");
        statement.values = [reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Execute as 'unsubmit review' query, where the done field is set to dalse.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to false.
     */
    public static executeUnSubmitReview(reviewId: number) {
        const statement = new PreparedStatement("unsubmit-review",
            "UPDATE review SET done=false WHERE id = $1 RETURNING *");
        statement.values = [reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Execute an 'insert mpc answer' query.
     * @param {number} answerOption - a 1 char answer.
     * @param {number} questionId - a question id.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateMpcAnswer(answerOption: number, questionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        const statement =  new PreparedStatement("add-mpc-answer",
            "INSERT INTO mcanswer(answer, mcquestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (mcquestion_id, review_id) " +
            "DO UPDATE SET answer=$1 RETURNING answer");
        statement.values = [answerOption, questionId, reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute an 'insert open answer' query.
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
     * Execute an 'insert range answer' query.
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
     * Execute a 'get range answer by review id' query.
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
     * Execute a 'get open answer by review id' query.
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
     * Executes a 'get all review comments' query.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeGetAllReviewComments(reviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-review-comments",
            "SELECT * FROM reviewcomment WHERE review_id = $1");
        statement.values = [reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'add review comment' query.
     * @param {number} reviewId - a review id.
     * @param {string} netId - a netid.
     * @param {string} comment - a comment.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeAddReviewComment(reviewId: number, netId: string, comment: string)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-review-comments",
            "INSERT INTO reviewcomment(comment, review_id, netid) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [comment, reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'update review comment' query.
     * @param {number} reviewCommentId - a review id.
     * @param {string} comment - a comment id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
     public static executeUpdateReviewComment(reviewCommentId: number, comment: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("put-review-comments",
            "UPDATE reviewcomment SET comment = $1 WHERE id = $2 RETURNING *");
        statement.values = [comment, reviewCommentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'delete review comment' query.
     * @param {number} reviewCommentId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
     public static executeDeleteReviewComment(reviewCommentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-review-comments",
            "DELETE FROM reviewcomment WHERE id = $1 RETURNING *");
        statement.values = [reviewCommentId];
        return Database.executeQuerySingleResult(statement);
     }

    /**
     * Gets the submission belonging to a reviewId.
     * @param {number} reviewId.
     * @returns {Promise<pgPromise.queryResult>} submission as database promise.
     */
    public static executeGetSubmissionByReviewId(reviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submission-by-review-id",
            "SELECT s.id, s.user_netid, s.group_id, s.file_path, s.date FROM review r JOIN submission s " +
            "ON r.submission_id = s.id WHERE r.id = $1");
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all reviews made by submission id.
     * @param {number} submissionId - submission_id.
     * @returns {Promise<pgPromise.queryResult>} all reviews as pg promise.
     */
    public static executeGetReviewsBySubmissionId(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-reviews-by-group-id-and-assignment-id",
            "SELECT id FROM review WHERE submission_id = $1 AND done = true");
        statement.values = [submissionId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all reviews for a certain assignment.
     * @param {number} assignmentId - assignment id.
     * @returns {Promise<pgPromise.queryResult>} - all reviews belonging to an assignment as pg promise.
     */
    public static executeGetReviewsByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-reviews-by-assignmentid",
            "SELECT review.* FROM review JOIN rubric ON review.rubric_assignment_id = rubric.assignment_id " +
            "WHERE rubric.assignment_id = $1");
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all done reviews for a certain assignment.
     * @param {number} assignmentId - an assignment id.
     * @return {Promise<pgPromise.queryResult>} - a promise of the database result.
     */
    public static executeGetAllDoneReviewsByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-done-reviews-by-assignmentid",
            "SELECT review.id, review.approved, review.ta_netid, review.user_netid as reviewer, submission.user_netid as submitter " +
            "FROM review JOIN assignmentlist ON assignmentlist.id = review.rubric_assignment_id " +
            "JOIN submission ON submission.id = review.submission_id WHERE assignmentlist.id = $1 " +
            "AND review.done = true");
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all done reviews of an assignment and of a student.
     * @param {number} assignmentId - an assignment id.
     * @return {Promise<pgPromise.queryResult>} - a promise of the database result.
     */
    public static executeGetAllDoneReviewsOfStudent(assignmentId: number, student: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-done-reviews-of-student",
            "SELECT review.id\n" +
            "FROM review \n" +
            "JOIN assignmentlist ON assignmentlist.id = review.rubric_assignment_id \n" +
            "WHERE assignmentlist.id = $1 \n" +
            "AND review.done = true\n" +
            "AND review.user_netid = $2");
        statement.values = [assignmentId, student];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all done reviews for a certain assignment which are not reviewed yet
     * @param {number} assignmentId - an assignment id.
     * @return {Promise<pgPromise.queryResult>} - a promise of the database result.
     */
    public static executeGetAllDoneReviewsByAssignmentIdUnreviewed(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-done-reviews-by-assignmentid-unreviewed",
            "SELECT review.id " +
            "FROM review JOIN assignmentlist ON assignmentlist.id = review.rubric_assignment_id " +
            "WHERE assignmentlist.id = $1 " +
            "AND review.done = true " +
            "AND review.approved IS NULL");
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Set approved to true or false of a review.
     * @param {boolean} approved - true or false.
     * @param {number} reviewId - a review id.
     * @param taNetId - a ta net id.
     * @return {any} - success or failure.
     */
    public static executeSetApprovedForReview(approved: boolean, reviewId: number, taNetId: string): any {
        const isApproved = (approved === true) ? "TRUE" : "FALSE";
        const statement = new PreparedStatement("update-approved-for-review",
            "UPDATE review SET approved=$1, TA_netid = $2 WHERE id = $3");
        statement.values = [isApproved, taNetId, reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Get a single review by the review id.
     * @param {number} reviewId - the id.
     * @return {Promise<pgPromise.queryResult>} a single review as promise.
     */
    public static executeGetReviewById(reviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-done-reviews-by-assignmentid-unreviewed",
            "SELECT * FROM Review WHERE id = $1");
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }
}