import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for review
 */
export default class ReviewPS {

    /**
     * Creates a submissionreview.
     * @param {string} userNetId - net id of the user.
     * @param {number} submissionId - submission id related to the review.
     * @param {number} rubricId - rubric id.
     * @returns {Promise<pgPromise.queryResult>} created review as pg promise.
     */
    public static executeCreateReview(userNetId: string, submissionId: number, rubricId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "create-review", text: 
        "INSERT INTO review(user_netid, submission_id, rubric_id) VALUES ($1, $2, $3) RETURNING *"});
        statement.values = [userNetId, submissionId, rubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Update the started_at date of a review to the current date. Only updated if the current value is null.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeUpdateStartedAtIfNull(reviewId: number) {
        const statement = new PreparedStatement({name: "update-started-at-analytics", text: 
            "UPDATE review SET started_at=$1 WHERE id = $2 AND started_at IS NULL"});
        statement.values = [new Date(), reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Update the downloaded_at date of a review to the current date. Only updated if the current value is null.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeUpdateDownloadedAtIfNull(reviewId: number) {
        const statement = new PreparedStatement({name: "update-updated-at-analytics", text: 
            "UPDATE review SET downloaded_at=$1 WHERE id = $2 AND downloaded_at IS NULL"});
        statement.values = [new Date(), reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Update the submitted_at date of a review to the current date. Always updated.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeUpdateSubmittedAt(reviewId: number) {
        const statement = new PreparedStatement({name: "update-submitted-at-analytics", text: 
            "UPDATE review SET submitted_at=$1 WHERE id = $2"});
        statement.values = [new Date(), reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Update the saved_at date of a review to the current date. Always updated.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeUpdateSavedAt(reviewId: number) {
        const statement = new PreparedStatement({name: "update-saved-at-analytics", text: 
            "UPDATE review SET saved_at=$1 WHERE id = $2"});
        statement.values = [new Date(), reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Creates a reviewEvaluation.
     */
    public static executeCreateReviewEvaluation(userNetId: string, evaluatedReviewId: number, evaluationRubricId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "create-review-evaluation", text: 
        "INSERT INTO review(user_netid, evaluated_review_id, rubric_id) VALUES ($1, $2, $3) RETURNING *"});
        statement.values = [userNetId, evaluatedReviewId, evaluationRubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets an reviewevaluation for a certain review
     */
    public static executeGetFullReviewEvaluation(evaluatedReviewId: number): any {
        const statement = new PreparedStatement({name: "get-review-evaluation-with-evaluated-review-id", text: 
        "SELECT * FROM review WHERE evaluated_review_id = $1"
    });
        statement.values = [evaluatedReviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether a reviewevaluation already exists
     */
    public static executeCheckExistsReviewEvaluation(evaluatedReviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "check-review-evaluation-presence", text: 
        "SELECT EXISTS(" +
        "SELECT * FROM review " +
        "WHERE evaluated_review_id = $1" +
        ")"
    });
        statement.values = [evaluatedReviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get review' query, where all reviews are fetched.
     * Only certain fields are displayed as students should not get them all
     * Additionally, the file_path is fetched from the corresponding submission table.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a result, containing tuples following the API documentation.
     */
    public static executeGetReview(reviewId: number): any {
        const statement = new PreparedStatement({name: "get-review-by-id", text: 
            "SELECT id, rubric_id, done, approved, flagged FROM review WHERE id = $1"});
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets a full review including all fields
     */
    public static executeGetFullReview(reviewId: number): any {
        const statement = new PreparedStatement({name: "get-full-review-by-id", text: 
            "SELECT * FROM review WHERE id = $1"});
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all reviews made by a certain user for a certain assignment
     * @param {string} userNetId - net id of the user.
     * @param {number} assignmentId - assignment id.
     * @returns {Promise<pgPromise.queryResult>} - all reviews as pg promise.
     */
    public static executeGetSubmissionReviewsByUserIdAndAssignmentId(userNetId: string, assignmentId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-reviews-by-user-id-and-assignment-id", text: 
        "SELECT review.* FROM review JOIN rubric ON review.rubric_id = rubric.id " +
        "WHERE review.user_netid = $1 AND rubric.assignment_id = $2" +
        "AND rubric.type = 'submission'"
        });
        statement.values = [userNetId, assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Execute a 'submit review' query, where the done field is set to true.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to true.
     */
    public static executeSubmitReview(reviewId: number) {
        const statement = new PreparedStatement({name: "submit-review", text: 
            "UPDATE review SET done=true WHERE id = $1 RETURNING *"});
        statement.values = [reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Execute as 'unsubmit review' query, where the done field is set to dalse.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a corresponding review where the done field is set to false.
     */
    public static executeUnSubmitReview(reviewId: number) {
        const statement = new PreparedStatement({name: "unsubmit-review", text: 
            "UPDATE review SET done=false WHERE id = $1 RETURNING *"});
        statement.values = [reviewId];
        return Database.executeQuery(statement);
    }

    /**
     * Flag a review.
     * @param {number} reviewId - review id.
     * @param {boolean} flagged - whether is should be flagged or not.
     * @return {Promise<any>}
     */
    public static executeFlagReview(reviewId: number, flagged: boolean) {
        const flaggedString = (flagged == true) ? "true" : "false";

        const statement = new PreparedStatement({name: "flag-review-boolean", text: 
            "UPDATE review SET flagged=$1 WHERE id = $2 RETURNING *"});
        statement.values = [flaggedString, reviewId];
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
        const statement =  new PreparedStatement({name: "add-mpc-answer", text: 
            "INSERT INTO mcanswer(answer, mcquestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (mcquestion_id, review_id) " +
            "DO UPDATE SET answer=$1 RETURNING answer"});
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
        const statement = new PreparedStatement({name: "add-open-answer", text: 
            "INSERT INTO openanswer(answer, openquestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (openquestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer"});
        statement.values = [answer, questionId, reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute an 'insert upload answer' query.
     * @param {number} answer - an open answer string.
     * @param {number} questionId - a question id.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateUploadAnswer(answer: string, questionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "add-upload-answer", text: 
            "INSERT INTO uploadanswer(answer, uploadquestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (uploadquestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer"});
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
        const statement = new PreparedStatement({name: "add-range-answer", text: 
            "INSERT INTO rangeanswer(answer, rangequestion_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (rangequestion_id, review_id) DO UPDATE SET answer=$1 RETURNING answer"});
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
        const statement = new PreparedStatement({name: "get-mc-answer-by-id", text: 
            "SELECT * FROM mcanswer WHERE review_id = $1 AND mcquestion_id = $2"});
        statement.values = [reviewId, mcQuestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get upload answer by review id' query.
     * @param {number} reviewId - a review id.
     * @param {number} uploadQuestionId - a mc question id.
     * @return {Promise<pgPromise.queryResult>} - a promise query result.
     */
    public static executeGetUploadAnswer(reviewId: number, uploadQuestionId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-upload-answer-by-id", text: 
            "SELECT * FROM uploadanswer WHERE review_id = $1 AND uploadquestion_id = $2"});
        statement.values = [reviewId, uploadQuestionId];
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
        const statement = new PreparedStatement({name: "get-range-answer-by-id", text: 
            "SELECT * FROM rangeanswer WHERE review_id = $1 AND rangequestion_id = $2"});
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
        const statement = new PreparedStatement({name: "get-open-answer-by-id", text: 
            "SELECT * FROM openanswer WHERE review_id = $1 AND openquestion_id = $2"});
        statement.values = [reviewId, openQuestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get all review comments' query.
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeGetAllReviewComments(reviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-review-comments", text: 
            "SELECT * FROM reviewcomment WHERE review_id = $1"});
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
        const statement = new PreparedStatement({name: "add-review-comments", text: 
            "INSERT INTO reviewcomment(comment, review_id, netid) VALUES ($1, $2, $3) RETURNING *"});
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
        const statement = new PreparedStatement({name: "put-review-comments", text: 
            "UPDATE reviewcomment SET comment = $1 WHERE id = $2 RETURNING *"});
        statement.values = [comment, reviewCommentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'delete review comment' query.
     * @param {number} reviewCommentId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
     public static executeDeleteReviewComment(reviewCommentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-review-comments", text: 
            "DELETE FROM reviewcomment WHERE id = $1 RETURNING *"});
        statement.values = [reviewCommentId];
        return Database.executeQuerySingleResult(statement);
     }

    /**
     * Gets the submission belonging to a reviewId.
     * @param {number} reviewId.
     * @returns {Promise<pgPromise.queryResult>} submission as database promise.
     */
    public static executeGetSubmissionByReviewId(reviewId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-submission-by-review-id", text: 
            "SELECT s.id, s.user_netid, s.group_id, s.file_path, s.date FROM review r JOIN submission s " +
            "ON r.submission_id = s.id WHERE r.id = $1"});
        statement.values = [reviewId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all reviews made by submission id.
     * @param {number} submissionId - submission_id.
     * @returns {Promise<pgPromise.queryResult>} all reviews as pg promise.
     */
    public static executeGetReviewsBySubmissionId(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-reviews-by-group-id-and-assignment-id", text: 
            "SELECT id FROM review WHERE submission_id = $1 AND done = true"});
        statement.values = [submissionId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all reviews for a certain assignment.
     * @param {number} assignmentId - assignment id.
     * @returns {Promise<pgPromise.queryResult>} - all reviews belonging to an assignment as pg promise.
     */
    public static executeGetSubmissionReviewsByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-reviews-by-assignmentid", text: 
            "SELECT review.* FROM review " +
            "JOIN rubric ON rubric.id = review.rubric_id " +
            "WHERE rubric.assignment_id = $1 " +
            "AND rubric.type = 'submission'"
    });
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all reviews for a certain rubric.
     * @param {number} rubricId - rubric id.
     * @returns {Promise<pgPromise.queryResult>} - all reviews belonging to an rubric as pg promise.
     */
    public static executeGetReviewsByRubricId(rubricId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-reviews-by-rubricid", text: 
            "SELECT * FROM review WHERE rubric_id = $1"});
        statement.values = [rubricId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all reviews of an assignment.
     * @param {number} assignmentId - an assignment id.
     * @param done - optional. True/false if the review should be done or not.
     * @return {Promise<pgPromise.queryResult>} - a promise of the database result.
     */
    public static executeGetAllSubmissionReviewsByAssignmentId(assignmentId: number, done?: boolean): Promise<pgPromise.queryResult> {
        let queryString = "SELECT review.id, review.approved, review.ta_netid, review.user_netid as reviewer, submission.user_netid as submitter, review.done, review.flagged " +
            "FROM review JOIN rubric ON review.rubric_id = rubric.id " +
            "JOIN assignmentlist ON assignmentlist.id = rubric.assignment_id " +
            "JOIN submission ON submission.id = review.submission_id WHERE assignmentlist.id = $1 " +
            "AND rubric.type = 'submission' ";

        if (done != undefined) {
            if (done === true) {
                queryString += "AND review.done = true";
            } else if (done === false) {
                queryString += "AND review.done = false";
            }
        }

        const statement = new PreparedStatement({name: "get-all-done-reviews-by-assignmentid", text: queryString});
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all done reviews of an assignment and of a student.
     * @param {number} assignmentId - an assignment id.
     * @return {Promise<pgPromise.queryResult>} - a promise of the database result.
     */
    public static executeGetAllDoneSubmissionReviewsOfStudent(assignmentId: number, student: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-done-reviews-of-student", text: 
            "SELECT review.id " +
            "FROM review JOIN rubric ON review.rubric_id = rubric.id " +
            "JOIN assignmentlist ON assignmentlist.id = rubric.assignment_id " +
            "WHERE assignmentlist.id = $1 " +
            "AND review.done = true " +
            "AND review.user_netid = $2 " +
            "AND rubric.type = 'submission'"
    });
        statement.values = [assignmentId, student];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all done reviews for a certain assignment which are not reviewed yet
     * @param {number} assignmentId - an assignment id.
     * @return {Promise<pgPromise.queryResult>} - a promise of the database result.
     */
    public static executeGetAllDoneSubmissionReviewsByAssignmentIdUnreviewed(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-done-reviews-by-assignmentid-unreviewed", text: 
            "SELECT review.id " +
            "FROM review JOIN rubric ON review.rubric_id = rubric.id " +
            "JOIN assignmentlist ON assignmentlist.id = rubric.assignment_id " +
            "WHERE assignmentlist.id = $1 " +
            "AND review.done = true " +
            "AND review.approved IS NULL " +
            "AND rubric.type = 'submission'"
    });
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
        const statement = new PreparedStatement({name: "update-approved-for-review", text: 
            "UPDATE review SET approved=$1, TA_netid = $2 WHERE id = $3"});
        statement.values = [isApproved, taNetId, reviewId];
        return Database.executeQuery(statement);
    }


    /**
     * Execute a 'get checkbox answer by review id and optionId' query.
     * @param {number} reviewId - a review id.
     * @param {number} checkboxOptionId - a checkbox option id.
     * @return {Promise<pgPromise.queryResult>} - a promise query result.
     */
    public static executeGetCheckboxAnswer(reviewId: number, checkboxOptionId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-checkbox-answer-by-review-id-and-option-id", text: 
            "SELECT * FROM checkboxanswer WHERE review_id = $1 AND checkboxoption_id = $2"});
        statement.values = [reviewId, checkboxOptionId];
        return Database.executeQuerySingleResult(statement);
    }


    /**
     * Execute an 'insert checkbox answer' query.
     * @param {number} answer - the answer (chosen or not)
     * @param {number} OptionId - the respective option
     * @param {number} reviewId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database query result, empty if succeeded.
     */
    public static executeUpdateCheckboxAnswer(answer: boolean, checkboxOptionId: number, reviewId: number)
        : Promise<pgPromise.queryResult> {
        const statement =  new PreparedStatement({name: "add-checkbox-answer", text: 
            "INSERT INTO checkboxanswer(answer, checkboxoption_id, review_id) VALUES ($1, $2, $3) " +
            "ON CONFLICT (checkboxoption_id, review_id) " +
            "DO UPDATE SET answer=$1 RETURNING answer"});
        statement.values = [answer, checkboxOptionId, reviewId];
        return Database.executeQuerySingleResult(statement);
    }
}