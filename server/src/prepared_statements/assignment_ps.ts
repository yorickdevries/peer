import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for assignment
 */
export default class AssignmentPS {

    /**
     * Executes a query that gets the review that was assigned to a certain user
     * @param {number} assignment_id - assignment id
     * @param {string} net_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetReviewByAssignmentId(assignmentId: number, netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-review",
            "SELECT * FROM review WHERE done=FALSE AND rubric_assignment_id=$1 AND user_netid=$2");
        statement.values = [assignmentId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes create review for a specific assignment and user
     * @param {string} net_id - net id
     * @param {number} submission_id - submission id
     * @param {number} assignment_id - assignment id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateReviewByAssignmentId(netId: string, submissionId: number, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("make-review-for-user",
            "INSERT INTO review (comment, user_netid, submission_id, rubric_assignment_id) VALUES ('', $1, $2, $3) RETURNING id, comment, user_netid, submission_id, rubric_assignment_id, done");
        statement.values = [netId, submissionId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get all submissions per assignment'
     * @param assignment_id - assignment_id
     */
    public static executeGetAllSubmissionsByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-subbmissions-by-assignmentId",
            "SELECT * FROM submission WHERE assignment_id = $1");
        statemen.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get assignment by course id'.
     * @param {string} courseId - a course id.
     * @return {any} a query result.
     */
    public static executeGetAssignments(courseId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-assignments-by-course-id",
            'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');
        statement.values = [courseId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get assignment by course id and assignment id'.
     * @param {string} assignmentId - an assignment id.
     * @return {any} a query result.
     */
    public static executeGetAssignmentById(assignmentId: number): any {
        const statement = new PreparedStatement("get-assignment-by-id",
            'SELECT * FROM "assignmentlist" WHERE "id" = $1');
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    // counts the amount of assignments with this specific id
    public static executeCountAssignmentById(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("count-assignment-by-id",
            'SELECT COUNT(1) FROM "assignmentlist" WHERE "id" = $1');
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'insert assignment'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param dueDate - a due date.
     * @param publishDate - a publish date.
     * @param courseId - a course id.
     * @param filename - filename
     * @return {any} a query result.
     */
    public static executeAddAssignment(title: string, description: string, dueDate: Date, publishDate: Date, courseId: number, filename: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("addAssignment",
            'INSERT INTO "assignmentlist" ("title", "description", "due_date", "publish_date", "course_id", "filename") ' +
            'VALUES ($1, $2, $3, $4, $5, $6) RETURNING title, description, id, course_id, due_date, publish_date, filename');
        statement.values = [title, description, dueDate, publishDate, courseId, filename];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'update assignment by assignment id'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param courseId - a course id.
     * @param assignmentId - an assignment id.
     * @return {any} a query result.
     */
    public static executeUpdateAssignmentById(title: string,
                                              description: string,
                                              courseId: number,
                                              assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-assignment-by-id",
            "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3 WHERE id=$4  " +
            "RETURNING title, description, id, course_id, due_date, publish_date, filename");
        statement.values = [title, description, courseId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes an 'get submission by assignment id' query
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetSubmissionByAssignmentId(netId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submission-by-assignment",
            "SELECT * FROM submission WHERE user_netid = $1 AND assignment_id = $2");
        statement.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    // Executes a 'get-all-groups-per-assignment' query
    public static executeGetGroupsByAssignmentId (id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-groups-per-assignment",
            'SELECT * FROM "assignmentgroup" WHERE "id" LIKE ($1)');
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'count reviews of submission' query.
     * @param assignmentId - an assignment id.
     * @param {string} netId - user net id.
     * @return {Promise<pgPromise.queryResult>} - promise of the database result.
     */
    public static executeCountAssignmentReviews(assignmentId: number, netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("count-reviews",
            "SELECT count(*) FROM review WHERE rubric_assignment_id = $1 AND user_netid = $2");
        statement.values = [assignmentId, netId];
        return Database.executeQuerySingleResult(statement);
    }
}