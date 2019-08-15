import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for courses.
 */
export default class CoursesPS {

    /**
     * Executes an 'update course' query.
     * @param {number} id - course id.
     * @param faculty
     * @param academicYear
     * @param courseCode
     * @param {string} description - description.
     * @param {string} name - name.
     * @param enrollable
     * @returns {Promise<pgPromise.queryResult>} the updated course as pg promise.
     */
    public static executeUpdateCourse(id: number, faculty: string, academicYear: string, courseCode: string, description: string, name: string, enrollable: boolean): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-course",
            'UPDATE "courselist" SET ("faculty", "academic_year", "course_code", "description", "name", "enrollable") = ($1, $2, $3, $4, $5, $6) WHERE "id" = $7 ' +
            "RETURNING id, faculty, academic_year, course_code, description, name, enrollable");
        statement.values = [faculty, academicYear, courseCode, description, name, enrollable, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'create course' query.
     * @param faculty
     * @param academicYear
     * @param courseCode
     * @param {string} description - description fo the course.
     * @param {string} name - name of the course.
     * @param enrollable
     * @returns {Promise<pgPromise.queryResult>} course that is inserted as pg promise.
     */
    public static executeCreateCourse(faculty: string, academicYear: string, courseCode: string, description: string, name: string, enrollable: boolean): any {
        const statement = new PreparedStatement("create-course",
            'INSERT INTO "courselist" ("faculty", "academic_year", "course_code", "description", "name", "enrollable")' +
            " VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, faculty, academic_year, course_code, description, name, enrollable");
        statement.values = [faculty, academicYear, courseCode, description, name, enrollable];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Get the available academic years.
     * @return {Promise<any>}
     */
    public static executeGetAcademicYears() {
        const statement = new PreparedStatement("get-academic-years", `
        SELECT * FROM academicyearlist
        `);
        return Database.executeQuery(statement);
    }

    /**
     * Get the available faculties.
     * @return {Promise<any>}
     */
    public static executeGetFaculties() {
        const statement = new PreparedStatement("get-faculties", `
        SELECT * FROM facultylist
        `);
        return Database.executeQuery(statement);
    }

    /**
     * Get the active academic year.
     * @return {Promise<any>}
     */
    public static executeGetActiveAcademicYear() {
        const statement = new PreparedStatement("get-active-academic-years", `
        SELECT * FROM academicyearlist WHERE active is TRUE
        `);
        return Database.executeQuery(statement);
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
     * Get all teachers of a course with the requesting user excluded..
     * @param {number} courseId - a course id.
     * @param teacherNetId - net id of the teacher
     * @return {any} - a database query result.
     */
    public static executeGetUsersByRoleExcludeTeacher(courseId: number, teacherNetId: string): any {
        const statement = new PreparedStatement("get-user-by-role-without-teacher",
            "SELECT user_netid " +
            "FROM enroll " +
            "WHERE course_id=$1 AND enroll.role='teacher' AND enroll.user_netid NOT IN ($2)");
        statement.values = [courseId, teacherNetId];
        return Database.executeQuery(statement);
    }

    /**
     * Get not enrolled courses for a specific user.
     * @param {string} netId - a net id.
     * @return {any} - all not enrolled courses for that user.
     */
    public static executeGetUnenrolledForUser(netId: string): any {
        const statement = new PreparedStatement("get-unenrolled-courses-for-netid",
            'SELECT * FROM "courselist" WHERE "id" NOT IN ' +
            '(SELECT "id" FROM "courselist" WHERE "id" IN (SELECT "course_id" FROM "enroll" WHERE user_netid LIKE $1)) AND enrollable = TRUE');
        statement.values = [netId];
        return Database.executeQuery(statement);
    }
}