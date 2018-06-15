import AuthorizationPS from "../prepared_statements/authorization_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import ReviewPS from "../prepared_statements/review_ps";

/**
 * Check whether the user who does the request is authenticated.
 * @param req - a request.
 * @param res - a response.
 * @param next - next.
 */
const authorizeCheck = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user is enrolled to the course of the assignment it wants to access
 */
const enrolledAssignmentCheck = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollment(assignment.course_id, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user in enrolled as teacher
 */
const enrolledAsTeacherAssignmentCheck = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user in enrolled as teacher for post and put
 */
const enrolledAsTeacherAssignmentCheckForPost = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(req.body.course_id, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check enrollment of a user as teacher or ta for a given course
 */
const enrolledAsTAOrTeacherAssignment = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user can show this review, i.e. is he the owner of the submission, is he the owner of the review
 * or is he a TA or teacher for the course of the review
 */
const checkAuthorizationForReview = async (req: any, res: any, next: any) => {
    try {
        const authCheckTAOrTeacher = await AuthorizationPS.executeCheckTAOrTeacherForReview(req.params.reviewId, req.userinfo.given_name);
        const authCheckOwner = await AuthorizationPS.executeCheckReviewMaker(req.params.reviewId, req.userinfo.given_name);
        const authCheckSubmissionOwner = await AuthorizationPS.executeCheckGroupBelongingToReview(req.params.reviewId, req.userinfo.given_name);
        const bool = authCheckTAOrTeacher.exists || authCheckOwner.exists || authCheckSubmissionOwner.exists;
        await response(res, bool, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is allowed to change the review
 */
const checkReviewOwner = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckReviewMakerNotDone(req.params.reviewId, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is allowed to submit the review
 */
const checkReviewOwnerDone = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckReviewMaker(req.params.reviewId, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is a ta or teacher for the course of this review
 */
const checkReviewTAOrTeacher = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckTAOrTeacherForReview(req.params.reviewId, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is a ta or teacher for the course of this review comment
 */
const checkOwnerReviewComment = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckOwnerReviewComment(req.params.reviewCommentId, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};



/**
 * Check if the person is authorized to view the group.
 */
const isAuthorizedToViewGroup = async (req: any, res: any, next: any) => {
    try {
        const authCheckTATeacher = await AuthorizationPS.isTAOrTeacherForGroup(req.userinfo.given_name, req.params.id);
        const authCheckStudent = await AuthorizationPS.isInGroup(req.userinfo.given_name, req.params.id);
        const authCheck = authCheckTATeacher.exists || authCheckStudent.exists;
        await response(res, authCheck, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Authorization for the fetching of a submission.
 * User should be TA, teacher or part of the group which has submitted.
 * @param req - a request.
 * @param res - a response.
 * @param next - a next.
 * @return {Promise<void>} - response containing the authorization.
 */
const getSubmissionAuth = async (req: any, res: any, next: any) => {
    try {
        // Fetch the submission
        const submission: any = await SubmissionsPS.executeGetSubmissionById(req.params.id);

        // Fetch the parameters required for the check.
        const courseId = (<any> await SubmissionsPS.executeGetCourseId(req.params.id)).course_id;
        const assignmentId: number = submission.assignment_id;
        const groupId: number = submission.group_id;

        // Execute the database checks.
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.userinfo.given_name);
        const submittedCheck: any = await SubmissionsPS.executeGetLatestSubmissionByAssignmentIdByGroupId(assignmentId, groupId);

        // Verify the authorization.
        await response(res, roleCheck.exists || submittedCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Authorization for the posting of a submission.
 * The user should be part of a group in the course.
 * @param req - a request.
 * @param res - a response.
 * @param next - a next.
 * @return {Promise<void>} - a response containing the authorization.
 */
const postSubmissionAuth = async (req: any, res: any, next: any) => {
    try {
        // Check if the user in in a group.
        const groupCheck: any = await AssignmentPS.executeGetGroupOfNetIdByAssignmentId(req.userinfo.given_name, req.body.assignmentId);

        // Verify the authorization.
        await response(res, groupCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Authorization for the fetching of a submission file.
 * User should be TA, teacher, part of the group which has submitted or a reviewer.
 * @param req - a request.
 * @param res - a response.
 * @param next - a next.
 * @return {Promise<void>} - response containing the authorization.
 */
const getSubmissionFileAuth = async (req: any, res: any, next: any) => {
    try {
        // Fetch the submission
        const submission: any = await SubmissionsPS.executeGetSubmissionById(req.params.id);

        // Fetch the parameters required for the check.
        const courseId = (<any> await SubmissionsPS.executeGetCourseId(req.params.id)).course_id;
        const assignmentId: number = submission.assignment_id;
        const groupId: number = submission.group_id;

        // Execute the database checks.
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.userinfo.given_name);
        const submittedCheck: any = await SubmissionsPS.executeGetLatestSubmissionByAssignmentIdByGroupId(assignmentId, groupId);
        const reviewCheck: any = await ReviewPS.executeGetReviewBySubmissionIdNetId(req.params.id, req.userinfo.given_name);

        // Verify the authorization.
        await response(res, roleCheck.exists || submittedCheck.exists || reviewCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Response method that handles the response
 */
const response = (res: any, bool: boolean, next: any) => {
    if (bool) {
        next();
    } else {
        res.sendStatus(401);
    }
};

/**
 * Exports
 */
export default {
    authorizeCheck,
    enrolledAssignmentCheck,
    checkOwnerReviewComment,
    checkReviewTAOrTeacher,
    checkReviewOwnerDone,
    checkReviewOwner,
    checkAuthorizationForReview,
    enrolledAsTeacherAssignmentCheck,
    isAuthorizedToViewGroup,
    enrolledAsTeacherAssignmentCheckForPost,
    enrolledAsTAOrTeacherAssignment,
    getSubmissionAuth,
    postSubmissionAuth,
    getSubmissionFileAuth
};
