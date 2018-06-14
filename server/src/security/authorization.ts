import AuthorizationPS from "../prepared_statements/authorization_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import RubricPS from "../prepared_statements/rubric_ps";

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
 * Check authorization to edit a rubric
 */
const checkRubricAuthorizationPost = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.body.rubric_assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.userinfo.given_name);
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
    checkMCOptionPost,
    enrolledAsTeacherAssignmentCheck,
    isAuthorizedToViewGroup,
    enrolledAsTeacherAssignmentCheckForPost,
    enrolledAsTAOrTeacherAssignment
};
