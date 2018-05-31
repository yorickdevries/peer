import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AuthorizationPS {

    public static checkEnrollment: PreparedStatement = new PreparedStatement("check-enrollment",
        'SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2)');

    public static checkEnrollmentAsTeacher: PreparedStatement = new PreparedStatement("check-enrollment-as-teacher",
        'SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2 AND role = teacher)')
    /**
     * Check with the course_id if a user is enrolled
     * @param {number} course_id - course_id
     * @param {String} netId - netId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCheckEnrollment(course_id: number, netId: String): any {
        this.checkEnrollment.values = [course_id, netId];
        return Database.executeQuerySingleResult(this.checkEnrollment);
    }

    /**
     * Check if the user is enrolled as teacher for the course of the assignemtn
     */
    public static executeCheckEnrollmentAsTeacher(course_id: number, netId: String): any {
        this.checkEnrollmentAsTeacher.values = [course_id, netId];
        return Database.executeQuerySingleResult(this.checkEnrollment);
    }

}