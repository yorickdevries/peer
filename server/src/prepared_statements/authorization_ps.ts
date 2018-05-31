import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

export default class AuthorizationPS {

    public static checkEnrollment: PreparedStatement = new PreparedStatement("check-enrollment",
        'SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2)');


    /**
     * Check with the course_id if a user is enrolled
     * @param {number} course_id - course_id
     * @param {String} netId - netId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCheckEnrollment(course_id: number, netId: String): Promise<pgPromise.queryResult> {
        this.checkEnrollment.values = [course_id, netId];
        return Database.executeQuerySingleResult(this.checkEnrollment);
    }

}