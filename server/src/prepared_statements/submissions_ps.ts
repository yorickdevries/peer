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
     * Executes a 'create submission' query
     */
    public static executeCreateSubmission(netid: string, assignmentId: number, filePath: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("create-submission",
            'INSERT INTO "submission" ("user_netid", "assignment_id", "file_path") VALUES ($1, $2, $3) RETURNING id, user_netid, assignment_id, file_path');
        statement.values = [netid, assignmentId, filePath];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'delete submission' query
     */
    public static executeDeleteSubmissionById(submissionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-submission",
            'DELETE FROM "submission" WHERE "id" = $1 RETURNING id, user_netid, assignment_id, file_path');
        statement.values = [submissionId];
        return Database.executeQuerySingleResult(statement);
    }
}