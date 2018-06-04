import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for authorization
 */
export default class AuthorizationPS {

    /**
     * Check with the course_id if a user is enrolled
     * @param {number} courseId - course_id
     * @param {String} netId - netId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCheckEnrollment(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment",
            "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2)");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is enrolled as teacher for the course of the assignment
     */
    public static executeCheckEnrollmentAsTeacher(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-as-teacher",
            "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2 AND role = 'teacher')");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is enrolled as TA or teacher
     */
    public static executeCheckEnrollAsTAOrTeacher(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-ta-teacher",
            "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2 AND (role = 'teacher' OR role = 'TA'))");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

}