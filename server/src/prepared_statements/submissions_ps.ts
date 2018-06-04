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
}