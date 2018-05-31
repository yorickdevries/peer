import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AuthorizationPS {

    public static checkEnrollment: PreparedStatement = new PreparedStatement("check-enrollment",
        "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2)");

    public static checkEnrollmentAsTeacher: PreparedStatement = new PreparedStatement("check-enrollment-as-teacher",
        "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2 AND role = teacher)");

    public static checkEnrollmentAsTAOrTeacher: PreparedStatement = new PreparedStatement("check-enrollment-ta-teacher",
        "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2 AND (role = teacher OR role = TA))");
    /**
     * Check with the course_id if a user is enrolled
     * @param {number} course_id - course_id
     * @param {String} netId - netId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCheckEnrollment(courseId: number, netId: String): any {
        this.checkEnrollment.values = [courseId, netId];
        return Database.executeQuerySingleResult(this.checkEnrollment);
    }

    /**
     * Check if the user is enrolled as teacher for the course of the assignment
     */
    public static executeCheckEnrollmentAsTeacher(courseId: number, netId: String): any {
        this.checkEnrollmentAsTeacher.values = [courseId, netId];
        return Database.executeQuerySingleResult(this.checkEnrollmentAsTeacher);
    }

    /**
     * Check if the user is enrolled as TA or teacher
     */
    public static executeCheckEnrollAsTAOrTeacher(courseId: number, netId: String): any {
        this.checkEnrollmentAsTAOrTeacher.values = [courseId, netId];
        return Database.executeQuerySingleResult(this.checkEnrollmentAsTAOrTeacher);
    }

}