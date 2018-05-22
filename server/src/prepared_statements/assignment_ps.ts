import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AssignmentPS {
    private static getAssignments: PreparedStatement = new PreparedStatement("get-assignments-by-course-id",
        'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');

    private static getAssignmentById: PreparedStatement = new PreparedStatement("get-assignment-by-id",
        'SELECT * FROM "assignmentlist" WHERE "id" = $1');

    private static addAssignment: PreparedStatement = new PreparedStatement("addAssignment",
        'INSERT INTO "assignmentlist" ("title", "description", "due_date", "publish_date", "course_id") VALUES ($1, $2, $3, $4, $5) RETURNING title, description, id, course_id, due_date, publish_date');

    private static updateAssignmentById: PreparedStatement = new PreparedStatement("update-assignment-by-id",
        "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3 WHERE id=$4  RETURNING title, description, id, course_id");

    private static getSubmissionByAssignmentId: PreparedStatement = new PreparedStatement("get-submission-by-assignment",
        "SELECT * FROM sumbission WHERE user_netid = $1 AND assignment_id = $2");


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
    public static executeAddAssignment(title: string, description: string, dueDate: Date, publishDate: Date, courseId: number): Promise<pgPromise.queryResult> {
        this.addAssignment.values = [title, description, dueDate, publishDate, courseId];
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
        this.getSubmissionByAssignmentId.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(this.getSubmissionByAssignmentId);
    }
}