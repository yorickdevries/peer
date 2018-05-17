import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AssignmentPS {
    private static getAssignments: PreparedStatement = new PreparedStatement("get-assignments-by-course-id",
        'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');

    private static getAssignmentById: PreparedStatement = new PreparedStatement("get-assignment-by-id",
        'SELECT * FROM "assignmentlist" WHERE "course_id" = $1 AND "id" = $2');

    private static addAssignment: PreparedStatement = new PreparedStatement("addAssignment",
        'INSERT INTO "assignmentlist" ("title", "description", "due_date", "publish_date", "course_id") VALUES ($1, $2, $3, $4, $5) RETURNING title, description, id, course_id, due_date, publish_date');

    private static updateAssignmentById: PreparedStatement = new PreparedStatement("update-assignment-by-id",
        "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3 WHERE id=$4  RETURNING title, description, id, course_id");


    /**
     * Executes a 'get assignment by course id'.
     * @param {string} course_id - a course id.
     * @return {any} a query result.
     */
    public static executeGetAssignments(course_id: number): Promise<pgPromise.queryResult> {
        this.getAssignments.values = [course_id];
        return Database.executeQuery(this.getAssignments);
    }

    /**
     * Executes a 'get assignment by course id and assignment id'.
     * @param {string} course_id - a course id.
     * @param {string} assignment_id - an assignment id.
     * @return {any} a query result.
     */
    public static executeGetAssignmentById(course_id: number, assignment_id: number): Promise<pgPromise.queryResult> {
        this.getAssignmentById.values = [course_id, assignment_id];
        return Database.executeQuery(this.getAssignmentById);
    }

    /**
     * Executes a 'insert assignment'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param due_date - a due date.
     * @param publish_date - a publish date.
     * @param course_id - a course id.
     * @return {any} a query result.
     */
    public static executeAddAssignment(title: string, description: string, due_date: Date, publish_date: Date, course_id: number): Promise<pgPromise.queryResult> {
        this.addAssignment.values = [title, description, due_date, publish_date, course_id];
        return Database.executeQuery(this.addAssignment);
    }

    /**
     * Executes a 'update assignment by assignment id'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param course_id - a course id.
     * @param assignment_id - an assignment id.
     * @return {any} a query result.
     */
    public static executeUpdateAssignmentById(title: string,
                                              description: string,
                                              course_id: number,
                                              assignment_id: number): Promise<pgPromise.queryResult> {
        this.updateAssignmentById.values = [title, description, course_id, assignment_id];
        return Database.executeQuery(this.updateAssignmentById);
    }
}