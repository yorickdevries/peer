import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class SubmissionsPS {
    private static getSubmissions: PreparedStatement = new PreparedStatement("get-submissions",
        'SELECT * FROM "submission"');

    private static getSubmissionById: PreparedStatement = new PreparedStatement("get-submission-by-id",
        'SELECT * FROM "submission" WHERE "id" = $1');

    private static getSubmissionsByAssignmentId: PreparedStatement = new PreparedStatement("get-submissions-by-assignment-id",
        'SELECT * FROM "submission" WHERE "assignment_id" = $1');

    private static getLatestSubmissionsByAssignmentId: PreparedStatement = new PreparedStatement("get-submissions-by-assignment-id",
        "SELECT * FROM submission s1 WHERE assignment_id = $1 AND date = (SELECT max(date) FROM submission s2 WHERE s2.group_id = s1.group_id)");

    private static createSubmission: PreparedStatement = new PreparedStatement("create-submission",
        'INSERT INTO "submission" ("user_netid", "group_id", "assignment_id", "file_path", "date") VALUES ($1, $2, $3, $4, $5) RETURNING *');

    private static deleteSubmission: PreparedStatement = new PreparedStatement("delete-submission",
        'DELETE FROM "submission" WHERE "id" = $1 RETURNING *');


    /**
     * Executes a 'get submissions'.
     */
    public static executeGetSubmissions(): Promise<pgPromise.queryResult> {
        return Database.executeQuery(this.getSubmissions);
    }

    /**
     * Executes a 'get submission by id' query
     */
    public static executeGetSubmissionById(id: number): Promise<pgPromise.queryResult> {
        this.getSubmissionById.values = [id];
        return Database.executeQuerySingleResult(this.getSubmissionById);
    }

    /**
     * Executes a 'get submissions by assignmentid' query
     */
    public static executeGetSubmissionsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        this.getSubmissionsByAssignmentId.values = [id];
        return Database.executeQuery(this.getSubmissionsByAssignmentId);
    }

    /**
     * Executes a 'get submissions by assignmentid' query
     */
    public static executeGetLatestSubmissionsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        this.getLatestSubmissionsByAssignmentId.values = [id];
        return Database.executeQuery(this.getLatestSubmissionsByAssignmentId);
    }

    /**
     * Executes a 'create submission' query
     */
    public static executeCreateSubmission(netid: string, groupId: number, assignmentId: number, filePath: string, date: Date): Promise<pgPromise.queryResult> {
        this.createSubmission.values = [netid, groupId, assignmentId, filePath, date];
        return Database.executeQuerySingleResult(this.createSubmission);
    }

    /**
     * Executes a 'delete submission' query
     */
    public static executeDeleteSubmissionById(submissionId: number): Promise<pgPromise.queryResult> {
        this.deleteSubmission.values = [submissionId];
        return Database.executeQuerySingleResult(this.deleteSubmission);
    }
}