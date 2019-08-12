import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for authorization
 */
export default class AuthorizationPS {

    /**
     * Check with the course_id if a user is enrolled.
     * @param {number} courseId - course_id.
     * @param {String} netId - netId.
     * @returns {Promise<pgPromise.queryResult>} true or false as pg promise.
     */
    public static executeCheckEnrollment(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment",
            "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2)");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is enrolled as teacher for the course of the assignment
     * @param {number} courseId - course to check.
     * @param {String} netId - net id of teacher.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckEnrollmentAsTeacher(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-as-teacher",
            "SELECT EXISTS(SELECT 1 FROM ENROLL WHERE course_id = $1 AND user_netid = $2 AND role = 'teacher')");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is enrolled as TA or teacher.
     * @param {number} courseId - course id.
     * @param {String} netId - net id of teacher or TA.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckEnrollAsTAOrTeacher(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-ta-teacher",
            "SELECT EXISTS(SELECT 1 FROM ENROLL " +
            "WHERE course_id = $1 AND user_netid = $2 AND (role = 'teacher' OR role = 'TA'))");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is enrolled as student.
     * @param {number} courseId - course id.
     * @param {String} netId - net id
     * @return {any} true or false as pg promise.
     */
    public static executeCheckEnrollAsStudent(courseId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-student",
            "SELECT EXISTS(SELECT 1 FROM ENROLL " +
            "WHERE course_id = $1 AND user_netid = $2 AND role = 'student')");
        statement.values = [courseId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is a TA or Teacher for the course a certain review is for.
     * @param {number} reviewId - review id.
     * @param {String} netId - id of ta or teacher.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckTAOrTeacherForReview(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-enrollment-ta-teacher-via-review",
            "SELECT EXISTS(SELECT * FROM review, submission, assignmentlist, courselist, enroll " +
            "WHERE review.submission_id = submission.id " +
            "AND submission.assignment_id = assignmentlist.id " +
            "AND assignmentlist.course_id = courselist.id " +
            "AND courselist.id = enroll.course_id " +
            "AND (enroll.role = 'TA' OR enroll.role = 'teacher') " +
            "AND review.id = $1 AND enroll.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the review is of by the user
     * @param {number} reviewId - review id.
     * @param {String} netId - net id of the maker of the review.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckReviewMaker(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-review-owner",
            "SELECT EXISTS(SELECT * FROM review WHERE review.id = $1 AND review.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }


    /**
     * Check if user is authorized to edit or delete mcquestion.
     * @param {number} questionId - question id.
     * @param {String} netId - net id of the user to check authorization.
     * @return {any} true or false as pg promise.
     */
    public static executeAuthorizationMCQuestion(questionId: number, netId: String): any {
        const statement = new PreparedStatement("check-authorization-mcquestion",
            "SELECT EXISTS(SELECT * FROM mcquestion, rubric, assignmentlist, enroll " +
            "WHERE mcquestion.rubric_id = rubric.id " +
            "AND rubric.assignment_id = assignmentlist.id " +
            "AND assignmentlist.course_id = enroll.course_id AND (enroll.role = 'teacher') " +
            "AND mcquestion.id = $1 AND enroll.user_netid = $2)");
        statement.values = [questionId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if user is authorized to edit or delete option.
     * @param {number} optionId - option id of a multiple choice question.
     * @param {String} netId - net id of the user to check authorization.
     * @return {any}
     */
    public static executeAuthorizationMCOption(optionId: number, netId: String): any {
        const statement = new PreparedStatement("check-authorization-mcoption",
            "SELECT EXISTS(SELECT * FROM mcoption, mcquestion, rubric, assignmentlist, enroll " +
            "WHERE mcoption.mcquestion_id = mcquestion.id " +
            "AND mcquestion.rubric_id = rubric.id " +
            "AND rubric.assignment_id = assignmentlist.id " +
            "AND assignmentlist.course_id = enroll.course_id AND (enroll.role = 'teacher') " +
            "AND mcoption.id = $1 AND enroll.user_netid = $2)");
        statement.values = [optionId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if user is authorized to edit or delete rangequestion.
     * @param {number} questionId - question id.
     * @param {String} netId - net id of the user.
     * @return {any} true or false as pg promise.
     */
    public static executeAuthorizationRangeQuestion(questionId: number, netId: String): any {
        const statement = new PreparedStatement("check-authorization-rangequestion",
            "SELECT EXISTS(SELECT * FROM rangequestion, rubric, assignmentlist, enroll " +
            "WHERE rangequestion.rubric_id = rubric.id " +
            "AND rubric.assignment_id = assignmentlist.id " +
            "AND assignmentlist.course_id = enroll.course_id AND (enroll.role = 'teacher') " +
            "AND rangequestion.id = $1 AND enroll.user_netid = $2)");
        statement.values = [questionId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if user is authorized to edit or delete openquestion.
     * @param {number} questionId - question id.
     * @param {String} netId - net id of the user.
     * @return {any} true or false as pg promise.
     */
    public static executeAuthorizationOpenQuestion(questionId: number, netId: String): any {
        const statement = new PreparedStatement("check-authorization-openquestion",
            "SELECT EXISTS(SELECT * FROM openquestion, rubric, assignmentlist, enroll " +
            "WHERE openquestion.rubric_id = rubric.id " +
            "AND rubric.assignment_id = assignmentlist.id " +
            "AND assignmentlist.course_id = enroll.course_id AND (enroll.role = 'teacher') " +
            "AND openquestion.id = $1 AND enroll.user_netid = $2)");
        statement.values = [questionId, netId];
        return Database.executeQuerySingleResult(statement);
    }


    /**
     * Check if the review is of the owner and not yet done.
     * @param {number} reviewId - review id.
     * @param {String} netId - net id of the user.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckReviewMakerNotDone(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-review-owner",
            "SELECT EXISTS(SELECT * FROM review WHERE review.done = false AND review.id = $1 AND review.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check if the user is te owner of the review comment
     * @param {number} reviewCommentId - id of the review comment.
     * @param {String} netId - net id of the user.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckOwnerReviewComment(reviewCommentId: number, netId: String): any {
        const statement = new PreparedStatement("check-reviewComment-owner",
            "SELECT EXISTS(SELECT * FROM reviewcomment WHERE id = $1 AND netid = $2)");
        statement.values = [reviewCommentId, netId];
        return Database.executeQuerySingleResult(statement);
    }


    /**
     * Check if the review belongs to the user, i.e. is the submission where the review is on review done by your group
     * @param {number} reviewId - review id.
     * @param {String} netId - net id of the user.
     * @return {any} true or false as pg promise.
     */
    public static executeCheckGroupBelongingToReview(reviewId: number, netId: String): any {
        const statement = new PreparedStatement("check-review-belonging-to-submission-of-user",
            "SELECT EXISTS(SELECT * FROM review, submission, groupusers WHERE review.submission_id = submission.id AND " +
            "submission.group_id = groupusers.group_groupId AND review.id = $1 AND groupusers.user_netid = $2)");
        statement.values = [reviewId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if the user is a ta or teacher for the course the group is in
     * @param {String} netId - net id of the user.
     * @param {number} groupId - group id.
     * @return {any} true or false as pg promise.
     */
    public static isTAOrTeacherForGroup(netId: String, groupId: number): any {
        const statement = new PreparedStatement("Check-if-netid-is-TA-or-Teacher-for-group",
            "SELECT EXISTS(SELECT * FROM grouplist, assignmentgroup, assignmentlist, enroll " +
            "WHERE grouplist.id = assignmentgroup.group_id AND assignmentgroup.assignment_id = assignmentlist.id " +
            "AND (enroll.role = 'TA' OR enroll.role = 'teacher') AND assignmentlist.course_id = enroll.course_id " +
            "AND enroll.user_netid = $1 AND grouplist.id = $2)");
        statement.values = [netId, groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if the user is a teacher for the course the group is in
     * @param {String} netId - net id of the user.
     * @param {number} groupId - group id.
     * @return {any} true or false as pg promise.
     */
    public static isTeacherForGroup(netId: String, groupId: number): any {
        const statement = new PreparedStatement("Check-if-netid-is-Teacher-for-group",
            "SELECT EXISTS(SELECT * FROM grouplist, assignmentgroup, assignmentlist, enroll " +
            "WHERE grouplist.id = assignmentgroup.group_id AND assignmentgroup.assignment_id = assignmentlist.id " +
            "AND enroll.role = 'teacher' AND assignmentlist.course_id = enroll.course_id " +
            "AND enroll.user_netid = $1 AND grouplist.id = $2)");
        statement.values = [netId, groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if the student is in a certain group
     * @param {String} netId - net id of the user.
     * @param {number} groupId - group id of the user.
     * @return {any} true or false as pg promise.
     */
    public static isInGroup(netId: String, groupId: number): any {
        const statement = new PreparedStatement("Check-if-student-is-in-group",
            "SELECT EXISTS(SELECT * FROM groupusers WHERE user_netid = $1 AND group_groupid = $2)");
        statement.values = [netId, groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if a user is authorized to get a submission.
     * @param {number} submissionId - a submission id.
     * @param {number} netId - a net id.
     * @return {any} true if authorized.
     */
    public static isGetSubmissionAuth(submissionId: number, netId: number): any {
        const statement = new PreparedStatement("check-submission-auth-submission-id",
            "SELECT EXISTS(SELECT * FROM submission JOIN grouplist ON submission.group_id = grouplist.id " +
            "JOIN groupusers ON grouplist.id = groupusers.group_groupid WHERE submission.id = $1 " +
            "AND groupusers.user_netid = $2)");
        statement.values = [submissionId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if a user is authorized to post a submission (for a given assignment).
     * @param {number} assignmentId - an assignment id.
     * @param {number} netId - a net id.
     * @return {any} true if authorized.
     */
    public static isPostSubmissionAuth(assignmentId: number, netId: number): any {
        const statement = new PreparedStatement("check-post-submission-submitter-assignment-id",
            "SELECT EXISTS(SELECT a.assignment_id, a.group_id FROM assignmentgroup a " +
            "JOIN groupusers g ON a.group_id = g.group_groupid WHERE g.user_netid = $1 AND a.assignment_id = $2)");
        statement.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if a user is authorized to put a submission comment (for a given assignment).
     * @param {number} submissionCommentId - an submission comment id id.
     * @param {number} netId - a net id.
     * @return {any} true if authorized.
     */
    public static isPutSubmissionCommentAuth(submissionCommentId: number, netId: number): any {
        const statement = new PreparedStatement("put-submission-comment-for-submission",
            "SELECT EXISTS(SELECT * FROM submissioncomment WHERE id = $1 AND netid = $2)");
        statement.values = [submissionCommentId, netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks if a user is authorized to access a submission file as a reviewer.
     * @param {number} submissionId - a submission id.
     * @param {number} netId - a user net id.
     * @return {any} true if authorized.
     */
    public static isSubmissionReviewerAuth(submissionId: number, netId: number): any {
        const statement = new PreparedStatement("check-submission-submitter-assignment-id-reviewer",
            "SELECT EXISTS(SELECT id FROM review WHERE submission_id = $1 AND user_netid = $2)");
        statement.values = [submissionId, netId];
        return Database.executeQuerySingleResult(statement);
    }
}