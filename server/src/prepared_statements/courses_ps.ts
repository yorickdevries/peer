import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for courses.
 */
export default class CoursesPS {

    /**
     * Executes an 'update course' query.
     * @param {number} id - course id.
     * @param {string} description - description.
     * @param {string} name - name.
     * @returns {Promise<pgPromise.queryResult>} the updated course as pg promise.
     */
    public static executeUpdateCourse(id: number, description: string, name: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-course",
            'UPDATE "courselist" SET ("description", "name") = ($1, $2) WHERE "id" = $3 ' +
            "RETURNING id, description, name");
        statement.values = [description, name, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'create course' query.
     * @param {string} description - description fo the course.
     * @param {string} name - name of the course.
     * @returns {Promise<pgPromise.queryResult>} course that is inserted as pg promise.
     */
    public static executeCreateCourse(description: string, name: string): any {
        const statement = new PreparedStatement("create-course",
            'INSERT INTO "courselist" ("description", "name") VALUES ($1, $2) RETURNING id, description, name');
        statement.values = [description, name];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get all courses' query where you are enrolled.
     * @param {string} userNetId - a netid of the current user.
     * @return {any} a query result.
     */
    public static executeGetAllEnrolledCourses(userNetId: string) {
        const statement = new PreparedStatement("get-all-courses-you-are-enrolled,",
            'SELECT * FROM "courselist" WHERE "id" IN (SELECT "course_id" FROM "enroll" ' +
            "WHERE user_netid LIKE $1)");
        statement.values = [userNetId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get all courses' query.
     * @return {any} a query result.
     */
    public static executeGetAllCourses(): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-courses",
            'SELECT * FROM "courselist"');
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get course by id' query.
     * @param {number} id.
     * @returns {Promise<pgPromise.queryResult>} course as pg promise.
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
            "SELECT enroll.role FROM enroll JOIN courselist ON courselist.id = enroll.course_id " +
            "WHERE user_netid = $1 AND course_id = $2");
        statement.values = [netId, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether an user exists in a course.
     * @param {number} courseId.
     * @param {string} netId.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeExistsEnrolledByCourseIdUserById(courseId: number, netId: string)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("exists-enrolled-user-by-id",
        'SELECT EXISTS(SELECT * FROM enroll WHERE "course_id" = $1 AND "user_netid" = $2)');
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes enroll in course with certain id.
     * @param {number} courseId - course_Id.
     * @param {string} netId - net_id.
     * @param {string} role - role.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeEnrollInCourseId(courseId: number, netId: string, role: string)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("enroll-in-course-id",
            "INSERT INTO enroll (course_id, user_netid, role) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [courseId, netId, role];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Set the role of a user net id.
     * @param {number} courseId - a course id to upgrade the net id in.
     * @param {string} netId - a net id of a user to upgrade.
     * @param {string} role - a new role, either teacher or TA.
     * @return {any} - a database query result.
     */
    public static executeSetRole(courseId: number, netId: string, role: string): any {
        const statement = new PreparedStatement("set-user-role",
            "UPDATE enroll SET role=$1 WHERE course_id =$2 AND user_netid=$3 RETURNING *");
        statement.values = [role, courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Get all users of a course that have a specific role.
     * @param {number} courseId - a course id.
     * @param {string} role - a role to filter on.
     * @return {any} - a database query result.
     */
    public static executeGetUsersByRole(courseId: number, role: string): any {
        const statement = new PreparedStatement("get-user-by-role",
            "SELECT user_netid FROM enroll WHERE course_id=$1 AND enroll.role=$2");
        statement.values = [courseId, role];
        return Database.executeQuery(statement);
    }

    /**
     * Get not enrolled courses for a specific user.
     * @param {string} netId - a net id.
     * @return {any} - all not enrolled courses for that user.
     */
    public static executeGetUnenrolledForUser(netId: string): any {
        const statement = new PreparedStatement("get-user-by-role",
            'SELECT * FROM "courselist" WHERE "id" NOT IN (SELECT "id" FROM "courselist" WHERE "id" IN (SELECT "course_id" FROM "enroll" WHERE user_netid LIKE $1))');
        statement.values = [netId];
        return Database.executeQuery(statement);
    }
}