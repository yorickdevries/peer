import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for courses§
 */
export default class CoursesPS {

    /**
     * Get all assignments that belong to a specific course.
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetAssignmentsByCourseId(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-assignment-of-course",
            'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');
        statement.values = [id];
        return Database.executeQuery(statement);
    }


    /**
     * Executes an 'update course' query
     * @param {number} id
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateCourse(id: number, description: string, name: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-course",
            'UPDATE "courselist" SET ("description", "name") = ($1, $2) WHERE "id" = $3 RETURNING id, description, name');
        statement.values = [description, name, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'create course' query
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateCourse(description: string, name: string): any {
        const statement = new PreparedStatement("create-course",
            'INSERT INTO "courselist" ("description", "name") VALUES ($1, $2) RETURNING id, description, name');
        statement.values = [description, name];

        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get all courses' query where you all enrolled
     * @param {string} userNetId - a netid of the current user.
     * @return {any} a query result.
     */
    public static executeGetAllEnrolledCourses(userNetId: string): any {
        const statement = new PreparedStatement("get-all-courses-you-are-enrolled,",
            'SELECT * FROM "courselist" WHERE "id" IN (SELECT "course_id" FROM "enroll" WHERE user_netid LIKE $1)');
        statement.values = [userNetId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get all courses' query
     * @return {any} a query result.
     */
    public static executeGetAllCourses(): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-courses",
            'SELECT * FROM "courselist"');
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get course by id' query
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetCourseById(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-course-by-id",
            'SELECT * FROM "courselist" WHERE "id" = $1');
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Execute a 'get role by id' query.
     * @param {string} netId - a user net id.
     * @param {number} id - a course id.
     * @return {Promise<pgPromise.queryResult>} a json object containing the role, if any (as promise).
     */
    public static executeGetRoleById(netId: string, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-course-role",
            "SELECT enroll.role FROM enroll JOIN courselist ON courselist.id = enroll.course_id WHERE user_netid = $1 AND course_id = $2");
        statement.values = [netId, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes counte ruser by course id, how many users in a certain course
     * @param {number} courseId - course_Id
     * @param {string} netId - net_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCountUserByCourseId(courseId: number, netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("count-user-by-course-id",
            'SELECT COUNT(1) FROM enroll WHERE "course_id" = $1 AND "user_netid" = $2');
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes enroll in course with certain id
     * @param {number} courseId - course_Id
     * @param {string} netId - net_id
     * @param {string} role - role
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeEnrollInCourseId(courseId: number, netId: string, role: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("enroll-in-course-id",
            "INSERT INTO enroll (course_id, user_netid, role) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [courseId, netId, role];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Upgrade a user net id to either a ta or teacher.
     * @param {number} courseId - a course id to upgrade the net id in.
     * @param {string} netId - a net id of a user to upgrade.
     * @param {string} role - a new role, either teacher or TA.
     * @return {any} - a database query result.
     */
    public static executeSetRole(courseId: number, netId: string, role: string): any {
        const statement = new PreparedStatement("upgrade-user",
            "UPDATE enroll SET role=$1 WHERE course_id =$2 AND user_netid=$3 RETURNING *");
        statement.values = [role, courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }
}