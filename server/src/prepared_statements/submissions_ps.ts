import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class SubmissionsPS {
    private static getSubmissions: PreparedStatement = new PreparedStatement("get-submissions",
        'SELECT * FROM "submission"');

    private static getSubmissionById: PreparedStatement = new PreparedStatement("get-submission-by-id",
        'SELECT * FROM "submission" WHERE "id" = $1');

    private static createSubmission: PreparedStatement = new PreparedStatement("create-submission",
        'INSERT INTO "submission" ("user_netid", "assignment_id", "file_path") VALUES ($1, $2, $3) RETURNING id, user_netid, assignment_id, file_path');

    private static deleteSubmission: PreparedStatement = new PreparedStatement("delete-submission",
        'DELETE FROM "submission" WHERE "id" = $1 RETURNING id, user_netid, assignment_id, file_path');


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
     * Executes a 'create submission' query
     */
    public static executeCreateSubmission(netid: string, assignmentId: number, filePath: string): Promise<pgPromise.queryResult> {
        this.createSubmission.values = [netid, assignmentId, filePath];
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