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

    /**
     * Check if the user is a TA or Teacher for the course a certain review is for
     */
    public static executeCheckTAOrTeacherForReview(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-ta-teacher-via-review",
            "SELECT EXISTS(SELECT * FROM review, submission, assignmentlist, enroll, courselist WHERE review.submission_id = submission.id AND submission.assignment_id = assignmentlist.id AND " +
            "assignmentlist.course_id = courselist.id AND (enroll.role = 'TA' OR enroll.role = 'teacher') AND review.id = $1 AND enroll.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the review is for or
     */
    public static executeCheckReviewMaker(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-review-owner",
            "SELECT EXISTS(SELECT * FROM review WHERE review.id = $1 AND review.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the review belongs to the user, i.e. is the submission where the review is on review done by your group
     */
    public static executeCheckGroupBelongingToReview(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-review-belonging-to-submussion-of-user",
            "SELECT EXISTS(SELECT * FROM review, submission, groupusers WHERE review.submission_id = submission.id AND " +
            "submission.group_id = groupusers.group_groupId AND review.id = $1 AND groupusers.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

}