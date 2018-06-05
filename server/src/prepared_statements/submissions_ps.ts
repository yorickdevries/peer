import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Class with prepared statements for submissions
 */
export default class SubmissionsPS {

    /**
     * Executes a 'get submissions'.
     */
    public static executeGetSubmissions(): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submissions",
            'SELECT * FROM "submission"');
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get submission by id' query
     */
    public static executeGetSubmissionById(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submission-by-id",
            'SELECT * FROM "submission" WHERE "id" = $1');
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get submissions by assignmentid' query
     */
    public static executeGetSubmissionsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submissions-by-assignment-id",
        'SELECT * FROM "submission" WHERE "assignment_id" = $1');
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get latest submissions by assignmentid' query
     */
    public static executeGetLatestSubmissionsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submissions-by-assignment-id",
        "SELECT * FROM submission s1 WHERE assignment_id = $1 AND date = (SELECT max(date) FROM submission s2 WHERE s2.group_id = s1.group_id)");
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'create submission' query
     */
    public static executeCreateSubmission(netid: string, groupId: number, assignmentId: number, filePath: string, date: Date): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("create-submission",
        'INSERT INTO "submission" ("user_netid", "group_id", "assignment_id", "file_path", "date") VALUES ($1, $2, $3, $4, $5) RETURNING *');
        statement.values = [netid, groupId, assignmentId, filePath, date];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'delete submission' query
     */
    public static executeDeleteSubmissionById(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-submission",
            'DELETE FROM "submission" WHERE "id" = $1 RETURNING *');
        statement.values = [submissionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get all submission comments' query.
     * @param {number} submissionId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeGetAllSubmissionComments(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-review-comments",
            "SELECT * FROM submissioncomment WHERE submission_id = $1");
        statement.values = [submissionId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'add submission comment' query.
     * @param {number} submissionId - a review id.
     * @param {string} taNetId - a ta net id.
     * @param {string} comment - a comment.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeAddSubmissionComment(submissionId: number, taNetId: string, comment: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-review-comments",
            "INSERT INTO submissioncomment(comment, submission_id, ta_netid) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [comment, submissionId, taNetId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'update submission comment' query.
     * @param {number} submissionId - a review id.
     * @param {string} comment - a comment id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeUpdateSubmissionComment(submissionId: number, comment: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("put-review-comments",
            "UPDATE submissioncomment SET comment = $1 WHERE id = $2 RETURNING *");
        statement.values = [comment, submissionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'delete submission comment' query.
     * @param {number} submissionId - a review id.
     * @return {Promise<pgPromise.queryResult>} - a database promise.
     */
    public static executeDeleteSubmissionComment(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-review-comments",
            "DELETE FROM submissioncomment WHERE id = $1 RETURNING *");
        statement.values = [submissionId];
        return Database.executeQuerySingleResult(statement);
    }
}