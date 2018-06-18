import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for assignment
 */
export default class AssignmentPS {
    /**
     * Executes a query that gets the review that was assigned to a certain user
     * @param {number} assignmentId - assignment id
     * @param {string} netId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetReviewByAssignmentId(assignmentId: number, netId: string): any {
        const statement = new PreparedStatement("get-review",
            "SELECT * FROM review WHERE done=FALSE AND rubric_assignment_id=$1 AND user_netid=$2");
        statement.values = [assignmentId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether an assignment exists in the database
     *
     * @static
     * @param {number} assignmentId
     * @returns {*}
     * @memberof AssignmentPS
     */
    public static executeExistsAssignmentById(assignmentId: number) {
        const statement = new PreparedStatement("exists-assignment-by-id",
        'SELECT EXISTS(SELECT * FROM "assignmentlist" WHERE "id" = $1)');
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes create review for a specific assignment and user
     * @param {string} netId - net id
     * @param {number} submissionId - submission id
     * @param {number} assignmentId - assignment id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateReviewByAssignmentId(netId: string, submissionId: number, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("make-review-for-user",
            "INSERT INTO review (user_netid, submission_id, rubric_assignment_id) VALUES ($1, $2, $3) RETURNING id, user_netid, submission_id, rubric_assignment_id, done");
        statement.values = [netId, submissionId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Get all assignments that belong to a specific course.
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
    public static executeGetAssignmentById(assignmentId: number) {
        const statement = new PreparedStatement("get-assignment-by-id",
            'SELECT * FROM "assignmentlist" WHERE "id" = $1');
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
    public static executeAddAssignment(title: string,
                                        description: string,
                                        courseId: number,
                                        reviewsPerUser: number,
                                        filename: string,
                                        publishDate: Date,
                                        dueDate: Date,
                                        reviewPublishDate: Date,
                                        reviewDueDate: Date): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("addAssignment",
        'INSERT INTO "assignmentlist" (title, description, course_id, reviews_per_user, filename, publish_date, due_date, review_publish_date, review_due_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *');
        statement.values = [title, description, courseId, reviewsPerUser, filename, publishDate, dueDate, reviewPublishDate, reviewDueDate];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'update assignment by assignment id'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param assignmentId - an assignment id.
     * @param dueDate - an assignment due date.
     * @param publishDate - an assignment publish date.
     * @param reviewsPerUser - allowed reviews per user.
     * @param filename - a file name of the assignment.
     * @param reviewDueDate - a due date for the review.
     * @param reviewPublishDate - a publish date of the review.
     * @return {any} a query result.
     */
    public static executeUpdateAssignmentById(title: string,
                                                description: string,
                                                reviewsPerUser: number,
                                                filename: string,
                                                publishDate: Date,
                                                dueDate: Date,
                                                reviewPublishDate: Date,
                                                reviewDueDate: Date,
                                                assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-assignment-by-id",
            "UPDATE assignmentlist " +
            "SET title=$1, description=$2, reviews_per_user=$3, filename=$4, publish_date=$5, due_date=$6, review_publish_date=$7, review_due_date=$8 " +
            "WHERE id = $9 RETURNING *");

        statement.values = [title, description, reviewsPerUser, filename, publishDate, dueDate, reviewPublishDate, reviewDueDate, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes an 'get submission by assignment id' query
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetSubmissionsByAssignmentId(netId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submissions-by-assignment",
            "SELECT s.id, s.user_netid, s.group_id, s.assignment_id, s.file_path, s.date FROM submission AS s JOIN groupusers gu ON s.group_id = gu.group_groupid WHERE gu.user_netid = $1 AND assignment_id = $2");
        statement.values = [netId, assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all groups for a certain assignment
     *
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetGroupsByAssignmentId (id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-groups-per-assignment",
        "SELECT g.id, g.group_name FROM assignmentgroup a JOIN grouplist g ON a.group_id = g.id WHERE assignment_id = $1");
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Gets the group of a user for a specific assignment
     *
     * @static
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     * @memberof AssignmentPS
     */
    public static executeGetGroupOfNetIdByAssignmentId(netId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-group-of-netid-by-assignmentid",
        "SELECT a.assignment_id, a.group_id FROM assignmentgroup a JOIN groupusers g ON a.group_id = g.group_groupid WHERE g.user_netid = $1 AND a.assignment_id = $2");
        statement.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether this netId already has a group for this assignment
     *
     * @static
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     * @memberof AssignmentPS
     */
    public static executeExistsGroupOfNetIdByAssignmentId(netId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("exists-group-netid-assignment-id",
        "SELECT EXISTS(SELECT a.assignment_id, a.group_id FROM assignmentgroup a JOIN groupusers g ON a.group_id = g.group_groupid WHERE g.user_netid = $1 AND a.assignment_id = $2)");
        statement.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }
}