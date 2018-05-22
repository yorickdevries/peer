import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AssignmentPS {
    private static getAssignments: PreparedStatement = new PreparedStatement("get-assignments-by-course-id",
        'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');

    private static getAssignmentById: PreparedStatement = new PreparedStatement("get-assignment-by-id",
        'SELECT * FROM "assignmentlist" WHERE "id" = $1');

    private static addAssignment: PreparedStatement = new PreparedStatement("addAssignment",
        'INSERT INTO "assignmentlist" ("title", "description", "due_date", "publish_date", "course_id", "filename") VALUES ($1, $2, $3, $4, $5, $6) RETURNING title, description, id, course_id, due_date, publish_date, filename');

    private static updateAssignmentById: PreparedStatement = new PreparedStatement("update-assignment-by-id",
        "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3, filename=$5 WHERE id=$4  RETURNING title, description, id, course_id, filename");

    private static getSubmissionByAssignmentId: PreparedStatement = new PreparedStatement("get-submission-by-assignment",
        "SELECT * FROM sumbission WHERE user_netid = $1 AND assignment_id = $2");

    private static getAllSubmissionsByAssignmentId: PreparedStatement = new PreparedStatement("get-all-subbmissions-by-assignmentId",
        "SELECT * FROM submission WHERE assignment_id = $1");

    private static createReviewByAssignmentId: PreparedStatement = new PreparedStatement("make-review-for-user",
        "INSERT INTO review SET comment='', user_netid=$1, submission_id=$2, rubric_assignment_id=$3 RETURNING id, comment, user_netid, submission_id, rubric_assignment_id, done");

    private static getReviewByAssignmentId: PreparedStatement = new PreparedStatement("get-review",
        "SELECT * FROM review WHERE done=FALSE AND assignment_id=$1 AND user_netid=$2");


    /**
     * Executes a query that gets the review that was assigned to a certain user
     * @param {number} assignment_id - assignment id
     * @param {string} net_id - net id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetReviewByAssignmentId(assignment_id: number, net_id: string): Promise<pgPromise.queryResult> {
        this.getReviewByAssignmentId.values = [assignment_id, net_id];
        return Database.executeQuerySingleResult(this.getReviewByAssignmentId);
    }

    /**
     * Executes create review for a specific assignment and user
     * @param {string} net_id - net id
     * @param {number} submission_id - submission id
     * @param {number} assignment_id - assignment id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateReviewByAssignmentId(net_id: string, submission_id: number, assignment_id:number): Promise<pgPromise.queryResult> {
        this.createReviewByAssignmentId.values = [net_id, submission_id, assignment_id];
        return Database.executeQuerySingleResult(this.createReviewByAssignmentId);
    }

    /**
     * Executes 'get all submissions per assignment'
     * @param assignment_id - assignment_id
     */
    public static executeGetAllSubmissionsByAssignmentId(assignment_id: number): Promise<pgPromise.queryResult> {
        this.getAllSubmissionsByAssignmentId.values = [assignment_id];
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

    /**
     * Executes a 'insert assignment'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param dueDate - a due date.
     * @param publishDate - a publish date.
     * @param courseId - a course id.
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
                                              assignmentId: number, filename: string): Promise<pgPromise.queryResult> {
        this.updateAssignmentById.values = [title, description, courseId, assignmentId, filename];
        return Database.executeQuerySingleResult(this.updateAssignmentById);
    }

    /**
     * Executes an 'get submission by assignment id' query
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetSubmissionByAssignmentId(netId: string, assignmentId: number): Promise<pgPromise.queryResult> {
        this.getSubmissionByAssignmentId.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(this.getSubmissionByAssignmentId);
    }
}