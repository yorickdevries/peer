import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AssignmentPS {
    private static getAssignments: PreparedStatement = new PreparedStatement("get-assignments-by-course-id",
        'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');

    private static getAssignmentById: PreparedStatement = new PreparedStatement("get-assignment-by-id",
        'SELECT * FROM "assignmentlist" WHERE "id" = $1');

    private static countAssignmentById: PreparedStatement = new PreparedStatement("count-assignment-by-id",
        'SELECT COUNT(1) FROM "assignmentlist" WHERE "id" = $1');

    private static addAssignment: PreparedStatement = new PreparedStatement("addAssignment",
        'INSERT INTO "assignmentlist" ("title", "description", "due_date", "publish_date", "course_id", "filename") VALUES ($1, $2, $3, $4, $5, $6) RETURNING title, description, id, course_id, due_date, publish_date, filename');

    private static updateAssignmentById: PreparedStatement = new PreparedStatement("update-assignment-by-id",
        "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3 WHERE id=$4  RETURNING title, description, id, course_id, filename");

    private static getSubmissionsByAssignmentId: PreparedStatement = new PreparedStatement("get-submissions-by-assignment-id",
        "SELECT * FROM submission WHERE user_netid = $1 AND assignment_id = $2");

    private static getAllSubmissionsByAssignmentId: PreparedStatement = new PreparedStatement("get-all-subbmissions-by-assignmentId",
        "SELECT * FROM submission WHERE assignment_id = $1");

    private static createReviewByAssignmentId: PreparedStatement = new PreparedStatement("make-review-for-user",
        "INSERT INTO review (comment, user_netid, submission_id, rubric_assignment_id) VALUES ('', $1, $2, $3) RETURNING id, comment, user_netid, submission_id, rubric_assignment_id, done");

    private static getReviewByAssignmentId: PreparedStatement = new PreparedStatement("get-review",
        "SELECT * FROM review WHERE done=FALSE AND rubric_assignment_id=$1 AND user_netid=$2");

    public static getGroupsByAssignmentId: PreparedStatement = new PreparedStatement("get-all-groups-per-assignment",
        'SELECT * FROM "assignmentgroup" WHERE "assignment_id" = ($1)');

    private static countReviews: PreparedStatement = new PreparedStatement("count-reviews",
        "SELECT count(*) FROM review WHERE rubric_assignment_id = $1 AND user_netid = $2");


    /**
     * Executes a query that gets the review that was assigned to a certain user
     * @param {number} assignment_id - assignment id
     * @param {string} net_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetReviewByAssignmentId(assignmentId: number, netId: string): Promise<pgPromise.queryResult> {
        this.getReviewByAssignmentId.values = [assignmentId, netId];
        return Database.executeQuerySingleResult(this.getReviewByAssignmentId);
    }

    /**
     * Executes create review for a specific assignment and user
     * @param {string} net_id - net id
     * @param {number} submission_id - submission id
     * @param {number} assignment_id - assignment id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateReviewByAssignmentId(netId: string, submissionId: number, assignmentId: number): Promise<pgPromise.queryResult> {
        this.createReviewByAssignmentId.values = [netId, submissionId, assignmentId];
        return Database.executeQuerySingleResult(this.createReviewByAssignmentId);
    }

    /**
     * Executes 'get all submissions per assignment'
     * @param assignment_id - assignment_id
     */
    public static executeGetAllSubmissionsByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        this.getAllSubmissionsByAssignmentId.values = [assignmentId];
        return Database.executeQuery(this.getAllSubmissionsByAssignmentId);
    }

    /**
     * Executes a 'get assignment by course id'.
     * @param {string} courseId - a course id.
     * @return {any} a query result.
     */
    public static executeGetAssignments(courseId: number): Promise<pgPromise.queryResult> {
        this.getAssignments.values = [courseId];
        return Database.executeQuery(this.getAssignments);
    }

    /**
     * Executes a 'get assignment by course id and assignment id'.
     * @param {string} courseId - a course id.
     * @param {string} assignmentId - an assignment id.
     * @return {any} a query result.
     */
    public static executeGetAssignmentById(assignmentId: number): Promise<pgPromise.queryResult> {
        this.getAssignmentById.values = [assignmentId];
        return Database.executeQuerySingleResult(this.getAssignmentById);
    }

    // counts the amount of assignments with this specific id
    public static executeCountAssignmentById(assignmentId: number): Promise<pgPromise.queryResult> {
        this.countAssignmentById.values = [assignmentId];
        return Database.executeQuerySingleResult(this.countAssignmentById);
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
        this.addAssignment.values = [title, description, dueDate, publishDate, courseId, filename];
        return Database.executeQuerySingleResult(this.addAssignment);
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
        this.updateAssignmentById.values = [title, description, courseId, assignmentId];
        return Database.executeQuerySingleResult(this.updateAssignmentById);
    }

    /**
     * Executes an 'get submission by assignment id' query
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetSubmissionByAssignmentId(netId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        this.getSubmissionsByAssignmentId.values = [netId, assignmentId];
        return Database.executeQuery(this.getSubmissionsByAssignmentId);
    }

    // Executes a 'get-all-groups-per-assignment' query
    public static executeGetGroupsByAssignmentId(id: number): Promise<pgPromise.queryResult> {
        this.getGroupsByAssignmentId.values = [id];
        return Database.executeQuery(this.getGroupsByAssignmentId);
    }

    /**
     * Executes a 'count reviews of submission' query.
     * @param assignmentId - an assignment id.
     * @param {string} netId - user net id.
     * @return {Promise<pgPromise.queryResult>} - promise of the database result.
     */
    public static executeCountAssignmentReviews(assignmentId: number, netId: string): Promise<pgPromise.queryResult> {
        this.countReviews.values = [assignmentId, netId];
        return Database.executeQuerySingleResult(this.countReviews);
    }
}