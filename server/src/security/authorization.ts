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
 * Check whether a user is enrolled for a course
 */
const enrolledCourseCheck = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckEnrollment(req.params.courseId, req.userinfo.given_name);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user is enrolled as teacher for a course
 */
const enrolledCourseTeacherCheck = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(req.params.courseId, req.userinfo.given_name);
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
 * Check authorization to edit a rubric
 */
const checkRubricAuthorizationPost = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.body.rubric_assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a rubric
 */
const checkRubricAuthorization = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.params.rubric_assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a mc question
 */
const checkMCQuestionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationMCQuestion(req.params.question_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to post mc option
 */
const checkMCOptionPost = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationMCQuestion(req.body.mcquestion_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a mc option
 */
const checkMCOptionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationMCOption(req.params.option_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};



/**
 * Check authorization to edit a open question
 */
const checkOpenQuestionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationOpenQuestion(req.params.question_id, req.userinfo.given_name);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a range question
 */
const checkRangeQuestionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationRangeQuestion(req.params.question_id, req.userinfo.given_name);
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

        // Check if past due date
        const review = await ReviewPS.executeGetReview(req.params.reviewId);
        const assignment: any = await AssignmentPS.executeGetAssignmentById(review.rubric_assignment_id);
        if ((new Date(assignment.review_due_date) > new Date()) && authCheckSubmissionOwner.exists) {
            throw new Error("You can only access the review after the review due date is passed.");
        }
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
 * User should be TA, teacher or part of the group of the submission.
 * @param req - a request.
 * @param res - a response.
 * @param next - a next.
 * @return {Promise<void>} - response containing the authorization.
 */
const getSubmissionAuth = async (req: any, res: any, next: any) => {
    try {
        // Fetch the parameters required for the check.
        const courseId = (<any> await SubmissionsPS.executeGetCourseId(req.params.id)).course_id;

        // Execute the database checks.
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.userinfo.given_name);
        const groupCheck: any = await AuthorizationPS.isGetSubmissionAuth(req.params.id, req.userinfo.given_name);

        // Verify the authorization.
        await response(res, roleCheck.exists || groupCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Authorization for the fetching of a submission.
 * User should be TA, teacher or part of the group of the submission.
 * @param req - a request.
 * @param res - a response.
 * @param next - a next.
 * @return {Promise<void>} - response containing the authorization.
 */
const getSubmissionCommentAuth = async (req: any, res: any, next: any) => {
    try {
        // Fetch the parameters required for the check.
        const submissionId = (<any> await SubmissionsPS.executeGetSubmissionBySubmissionCommentId(req.params.submissionCommentId)).submission_id;
        const courseId = (<any> await SubmissionsPS.executeGetCourseId(submissionId)).course_id;

        // Execute the database checks.
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.userinfo.given_name);
        const groupCheck: any = await AuthorizationPS.isGetSubmissionAuth(submissionId, req.userinfo.given_name);

        // Verify the authorization.
        await response(res, roleCheck.exists || groupCheck.exists, next);
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
        const groupCheck: any = await AuthorizationPS.isPostSubmissionAuth(req.body.assignmentId, req.userinfo.given_name);
        // Verify the authorization.
        await response(res, groupCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Authorization for the putting of a submission comment.
 * The user should be part of a group in the course.
 * @param req - a request.
 * @param res - a response.
 * @param next - a next.
 * @return {Promise<void>} - a response containing the authorization.
 */
const putSubmissionCommentAuth = async (req: any, res: any, next: any) => {
    try {
        // Check if the user in in a group.
        const authorCheck: any = await AuthorizationPS.isPutSubmissionCommentAuth(req.params.submissionCommentId, req.userinfo.given_name);
        // Verify the authorization.
        await response(res, authorCheck.exists, next);
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
        // Fetch the parameters required for the check.
        const courseId = (<any> await SubmissionsPS.executeGetCourseId(req.params.id)).course_id;

        // Execute the database checks.
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.userinfo.given_name);
        const groupCheck: any = await AuthorizationPS.isGetSubmissionAuth(req.params.id, req.userinfo.given_name);
        const reviewCheck: any = await AuthorizationPS.isSubmissionReviewerAuth(req.params.id, req.userinfo.given_name);

        // Verify the authorization.
        await response(res, roleCheck.exists || groupCheck.exists || reviewCheck.exists, next);
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
    checkOpenQuestionEdit,
    checkRangeQuestionEdit,
    checkMCQuestionEdit,
    checkMCOptionEdit,
    checkRubricAuthorizationPost,
    checkAuthorizationForReview,
    enrolledCourseCheck,
    checkMCOptionPost,
    enrolledCourseTeacherCheck,
    isAuthorizedToViewGroup,
    enrolledAsTeacherAssignmentCheck,
    enrolledAsTeacherAssignmentCheckForPost,
    enrolledAsTAOrTeacherAssignment,
    getSubmissionAuth,
    postSubmissionAuth,
    getSubmissionFileAuth,
    getSubmissionCommentAuth,
    putSubmissionCommentAuth,
    checkRubricAuthorization
};
