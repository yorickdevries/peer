import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Class with prepared statements for submissions.
 */
export default class SubmissionsPS {

    /**
     * Get the course id through the submission id.
     * @param {number} submissionId - submission id.
     * @return database single result of the course id.
     */
    public static executeGetCourseId(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-course-id", text:
            "SELECT course_id " +
            "FROM submission JOIN assignmentlist ON submission.assignment_id = assignmentlist.id " +
            "WHERE submission.id = $1"});
        statement.values = [submissionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get submission by submission id' query.
     * @param {number} id - submission id.
     * @return {Promise<pgPromise.queryResult>} submission as pg promise.
     */
    public static executeGetSubmissionById(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-submission-by-id", text:
            'SELECT * FROM "submission" WHERE "id" = $1'});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get all submissions by assignment id' query.
     * @param {number} id - assignment id.
     * @return {Promise<pgPromise.queryResult>} all submissions as pg promise.
     */
    public static executeGetAllSubmissionsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-submissions-by-assignment-id", text:
        "SELECT s1.*, s2.comment_count " +
            "FROM submission s1 JOIN (SELECT s.id, COUNT(sc.submission_id) AS comment_count FROM submission s " +
            "LEFT JOIN submissioncomment sc ON s.id = sc.submission_id GROUP BY s.id) s2 ON s2.id = s1.id " +
            "WHERE s1.assignment_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get latest submissions by assignment id' query.
     * @param {number} id - assignment id.
     * @return {Promise<pgPromise.queryResult>} all latest submission as pg promise.
     */
    public static executeGetLatestSubmissionsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-latest-submissions-by-assignment-id", text:
        "SELECT s1.*, s2.comment_count FROM submission s1 JOIN "
        + "(SELECT s.id, COUNT(sc.submission_id) AS comment_count FROM submission s " +
            "LEFT JOIN submissioncomment sc ON s.id = sc.submission_id GROUP BY s.id) s2 ON s2.id = s1.id "
        + "WHERE s1.assignment_id = $1 AND s1.date = (SELECT max(date) FROM submission s3 " +
            "WHERE s3.group_id = s1.group_id AND s3.assignment_id = $1)"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Gets the latest submission of an assignment by a certain group.
     * @param {number} assignmentId - assignment id.
     * @param {number} groupId - group id.
     * @return {Promise<pgPromise.queryResult>} all latest submissions as pg promise.
     */
    public static executeGetLatestSubmissionByAssignmentIdByGroupId(assignmentId: number, groupId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-latest-submission-by-assignmentid-by-groupid", text:
        "SELECT * FROM submission s1 WHERE assignment_id = $1 AND group_id = $2 AND date = (SELECT max(date) " +
            "FROM submission s2 WHERE s2.group_id = $2)"});
        statement.values = [assignmentId, groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets all the submissions of an assignment by a certain group.
     * @param {number} assignmentId - assignment id.
     * @param {number} groupId - group id.
     * @return {Promise<pgPromise.queryResult>} all submissions as pg promise.
     */
    public static executeGetAllSubmissionByAssignmentIdByGroupId(assignmentId: number, groupId: number)
        : any {
        const statement = new PreparedStatement({name: "get-all-submission-by-assignmentid-by-groupid", text:
        "SELECT * FROM submission s1 WHERE assignment_id = $1 AND group_id = $2"});
        statement.values = [assignmentId, groupId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'create submission' query.
     * @param {string} netid - net id of the submission.
     * @param {number} groupId - group id of the user.
     * @param {number} assignmentId - assignment id.
     * @param {string} filePath - file path of the submission file.
     * @return {Promise<pgPromise.queryResult>} created submission as pg promise.
     */
    public static executeCreateSubmission(netid: string, groupId: number, assignmentId: number, filePath: string)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "create-submission", text:
        'INSERT INTO "submission" ("user_netid", "group_id", "assignment_id",  "file_path") ' +
            "VALUES ($1, $2, $3, $4) RETURNING *"});
        statement.values = [netid, groupId, assignmentId, filePath];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get all submission comments' query.
     * @param {number} submissionId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeGetAllSubmissionComments(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-submission-comments", text:
            "SELECT * FROM submissioncomment WHERE submission_id = $1"});
        statement.values = [submissionId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'add submission comment' query.
     * @param {number} submissionId - a review id.
     * @param {string} netId - a netid.
     * @param {string} comment - a comment.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeAddSubmissionComment(submissionId: number, netId: string, comment: string)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "add-submission-comments", text:
            "INSERT INTO submissioncomment(comment, submission_id, netid) VALUES ($1, $2, $3) RETURNING *"});
        statement.values = [comment, submissionId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'update submission comment' query.
     * @param {number} submissionCommentId - a submission comment id.
     * @param {string} comment - a comment id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeUpdateSubmissionComment(submissionCommentId: number, comment: string)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "put-submission-comments", text:
            "UPDATE submissioncomment SET comment = $1 WHERE id = $2 RETURNING *"});
        statement.values = [comment, submissionCommentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'delete submission comment' query.
     * @param {number} submissionCommentId - a submisison comment id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeDeleteSubmissionComment(submissionCommentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-submission-comments", text:
            "DELETE FROM submissioncomment WHERE id = $1 RETURNING *"});
        statement.values = [submissionCommentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Get the submission by a submission comment id.
     * @param {number} submissionCommentId - a submission comment id.
     * @return {Promise<pgPromise.queryResult>}
     */
    public static executeGetSubmissionBySubmissionCommentId(submissionCommentId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-submission-comments", text:
            "SELECT * FROM submissioncomment WHERE id = $1"});
        statement.values = [submissionCommentId];
        return Database.executeQuerySingleResult(statement);
    }
}