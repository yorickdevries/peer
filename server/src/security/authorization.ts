import AuthorizationPS from "../prepared_statements/authorization_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import ReviewPS from "../prepared_statements/review_ps";
import CoursesPS from "../prepared_statements/courses_ps";

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
 * Checks whether a user is an employee
 * @param req - a request.
 * @param res - a response.
 * @param next - next.
 */
const employeeCheck = (req: any, res: any, next: any) => {
    if (req.user.affiliation === "employee" || req.user.affiliation.includes("employee")) {
        next();
    } else {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user is enrolled in a group of the assignment it wants to access
 * or is manager of the course
 */
const enrolledAssignmentCheck = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        // Student in assignment or teacher/TA in course
        const selfEnrollment = assignment.one_person_groups;
        const inGroup = await AuthorizationPS.executeCheckAssignmentEnrollment(assignment.id, req.user.netid);
        const taOrTeacherInCourse = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.user.netid);
        const authCheck = selfEnrollment || inGroup.exists || taOrTeacherInCourse.exists;
        response(res, authCheck, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user iis allowed to get a rubric
 */
const getRubricCheck = async (req: any, res: any, next: any) => {
    try {
        const rubric = await RubricPS.executeGetRubricById(req.params.rubric_id);
        const assignment = await AssignmentPS.executeGetAssignmentById(rubric.assignment_id);

        // Student in assignment or teacher/TA in course
        const inGroup = await AuthorizationPS.executeCheckAssignmentEnrollment(assignment.id, req.user.netid);
        const taOrTeacherInCourse = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.user.netid);
        const authCheck = inGroup.exists || taOrTeacherInCourse.exists;
        response(res, authCheck, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user is enrolled for a course
 */
const enrolledCourseCheck = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckCourseEnrollment(req.params.courseId, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(req.params.courseId, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.user.netid);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user in enrolled as teacher
 */
const enrolledAsTeacherTwoAssignmentsCheck = async (req: any, res: any, next: any) => {
    try {
        const assignment1 = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id1);
        const assignment2 = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id2);
        if (assignment1.course_id != assignment2.course_id) {
            throw new Error("Different courses");
        }
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment1.course_id, req.user.netid);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a user in enrolled as teacher
 */
const enrolledAsTeacherThreeAssignmentsCheck = async (req: any, res: any, next: any) => {
    try {
        const assignment1 = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id1);
        const assignment2 = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id2);
        const assignment3 = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id3);
        if (assignment1.course_id != assignment2.course_id || assignment1.course_id != assignment3.course_id) {
            throw new Error("Different courses");
        }
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment1.course_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(req.body.course_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

const enrolledAsTAOrTeacherCourse = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(req.params.courseId, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check enrollment of a user as student for a given assignment
 */
const enrolledAsStudentAssignment = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollAsStudent(assignment.course_id, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to add a rubric
 */
const checkRubricAuthorizationPost = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.body.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to add a rubric question
 */
const checkRubricAuthorizationPostQuestion = async (req: any, res: any, next: any) => {
    try {
        const rubric = await RubricPS.executeGetRubricById(req.body.rubric_id);
        const assignment = await AssignmentPS.executeGetAssignmentById(rubric.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.user.netid);
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
        const rubric = await RubricPS.executeGetRubricById(req.params.rubric_id);
        const assignment = await AssignmentPS.executeGetAssignmentById(rubric.assignment_id);
        const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeAuthorizationMCQuestion(req.params.question_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeAuthorizationMCQuestion(req.body.mcquestion_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeAuthorizationMCOption(req.params.option_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeAuthorizationOpenQuestion(req.params.question_id, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a upload question
 */
const checkUploadQuestionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationUploadQuestion(req.params.question_id, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeAuthorizationRangeQuestion(req.params.question_id, req.user.netid);
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
        const review = await ReviewPS.executeGetFullReview(req.params.reviewId);
        const rubric = await RubricPS.executeGetRubricById(review.rubric_id);

        if (rubric.type == "submission") {
            const authCheckTAOrTeacher = await AuthorizationPS.executeCheckTAOrTeacherForReview(req.params.reviewId, req.user.netid);
            const authCheckOwner = (review.user_netid == req.user.netid);
            const authCheckSubmissionOwner = await AuthorizationPS.executeCheckGroupBelongingToReview(req.params.reviewId, req.user.netid);

            // Check if past due date
            const assignment: any = await AssignmentPS.executeGetAssignmentById(rubric.assignment_id);
            // If you are being reviewed and are not reviewing yourself,
            // you can only access the review after the due date and when its marked as done
            if (
                authCheckSubmissionOwner.exists
                &&
                !authCheckOwner
                &&
                (new Date(assignment.review_due_date) > new Date() || !review.done)
                ) {
                throw new Error("You can only access the review after the review due date is passed and the review is marked as done.");
            }

            const bool = authCheckTAOrTeacher.exists || authCheckOwner || authCheckSubmissionOwner.exists;
            await response(res, bool, next);
        } else if (rubric.type == "review") {
            // check ownership
            const authCheckTAOrTeacher = await AuthorizationPS.executeCheckTAOrTeacherForReview(review.id, req.user.netid);
            const authCheckSubmissionOwner = await AuthorizationPS.executeCheckGroupBelongingToReview(review.evaluated_review_id, req.user.netid);

            const bool = authCheckTAOrTeacher.exists || authCheckSubmissionOwner.exists;
            await response(res, bool, next);
        } else {
            throw new Error("No or invalid Rubric type");
        }
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user can get the evaluation of this review
 */
const checkAuthorizationForGettingReviewEvaluation = async (req: any, res: any, next: any) => {
    try {
        const reviewId = req.params.reviewId;

        // check ownership of the review (regardles of whether the evaluationReview exists)
        const authCheckTAOrTeacher = await AuthorizationPS.executeCheckTAOrTeacherForReview(reviewId, req.user.netid);
        const authCheckSubmissionOwner = await AuthorizationPS.executeCheckGroupBelongingToReview(reviewId, req.user.netid);

        const bool = authCheckTAOrTeacher.exists || authCheckSubmissionOwner.exists;
        await response(res, bool, next);


    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user can evaluate this review
 */
const checkAuthorizationForCreatingReviewEvaluation = async (req: any, res: any, next: any) => {
    try {
        const reviewId = req.params.reviewId;
        // check whether the user belongs to the group of the submission
        const authCheckSubmissionOwner = await AuthorizationPS.executeCheckGroupBelongingToReview(reviewId, req.user.netid);
        if (!authCheckSubmissionOwner.exists) {
            throw new Error("This review is not about you");
        }
        const review = await ReviewPS.executeGetFullReview(reviewId);

        // the review should be done in the first place
        if (!review.done) {
            throw new Error("This review isn't submitted");
        }

        const rubric = await RubricPS.executeGetRubricById(review.rubric_id);
        // the review should be about a submission
        if (rubric.type !== "submission") {
            throw new Error("This review isn't from a submission");
        }

        const assignment: any = await AssignmentPS.executeGetAssignmentById(rubric.assignment_id);
        // review evaluation should be enabled
        if (!assignment.review_evaluation) {
            throw new Error("This assignment does not have review evaluation enabled");
        }

        // check whether it is the past due date of review
        if (new Date(assignment.review_due_date) > new Date()) {
            throw new Error("You can only evaluate the review after the review due date is passed.");
        }

        // check whether it is before the review evaluation due date
        if (new Date(assignment.review_evaluation_due_date) < new Date()) {
            throw new Error("You can only evaluate the review until the review evaluation due date.");
        }

        await response(res, true, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is allowed to change the review
 */
const checkReviewOwner = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckReviewMakerNotDone(req.params.reviewId, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeCheckReviewMaker(req.params.reviewId, req.user.netid);
        response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is allowed to submit the review
 */
const checkReviewEditAllowed = async (req: any, res: any, next: any) => {
    try {
        const review = await ReviewPS.executeGetFullReview(req.params.reviewId);
        const rubric = await RubricPS.executeGetRubricById(review.rubric_id);
        const assignmentId =  rubric.assignment_id;
        const assignment = await AssignmentPS.executeGetAssignmentById(assignmentId);
        const currentDate = new Date();

        if (rubric.type == "submission") {
            // check whether the user is on time
            const withinTimeFrame = (new Date(assignment.review_publish_date) < currentDate && new Date(assignment.review_due_date) > currentDate);
            response(res, withinTimeFrame, next);
        } else if (rubric.type == "review") {
            const withinTimeFrame = (new Date(assignment.review_due_date) < currentDate && currentDate < new Date(assignment.review_evaluation_due_date));
            response(res, withinTimeFrame, next);
        } else {
            response(res, true, next);
        }
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is allowed to submit the submission
 */
const checkSubmissionBetweenPublishDue = async (req: any, res: any, next: any) => {
    try {
        const assignment = await AssignmentPS.executeGetAssignmentById(req.body.assignmentId);
        // check whether the user is on time
        const currentDate = new Date();
        const withinTimeFrame = (new Date(assignment.publish_date) < currentDate && new Date(assignment.due_date) > currentDate);
        response(res, withinTimeFrame, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the user is a ta or teacher for the course of this review
 */
const checkReviewTAOrTeacher = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeCheckTAOrTeacherForReview(req.params.reviewId, req.user.netid);
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
        const authCheck = await AuthorizationPS.executeCheckOwnerReviewComment(req.params.reviewCommentId, req.user.netid);
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
        const authCheckTATeacher = await AuthorizationPS.isTAOrTeacherForGroup(req.user.netid, req.params.id);
        const authCheckStudent = await AuthorizationPS.isInGroup(req.user.netid, req.params.id);
        const authCheck = authCheckTATeacher.exists || authCheckStudent.exists;
        await response(res, authCheck, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check if the person is authorized to edit the group.
 */
const isAuthorizedToEditGroup = async (req: any, res: any, next: any) => {
    try {
        const authCheckTeacher = await AuthorizationPS.isTeacherForGroup(req.user.netid, req.params.id);
        const authCheck = authCheckTeacher.exists;
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
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.user.netid);
        const groupCheck: any = await AuthorizationPS.isGetSubmissionAuth(req.params.id, req.user.netid);

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
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.user.netid);
        const groupCheck: any = await AuthorizationPS.isGetSubmissionAuth(submissionId, req.user.netid);

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
        const groupCheck: any = await AuthorizationPS.isPostSubmissionAuth(req.body.assignmentId, req.user.netid);
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
        const authorCheck: any = await AuthorizationPS.isPutSubmissionCommentAuth(req.params.submissionCommentId, req.user.netid);
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
        const roleCheck: any = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(courseId, req.user.netid);
        const groupCheck: any = await AuthorizationPS.isGetSubmissionAuth(req.params.id, req.user.netid);
        const reviewCheck: any = await AuthorizationPS.isSubmissionReviewerAuth(req.params.id, req.user.netid);

        // Verify the authorization.
        await response(res, roleCheck.exists || groupCheck.exists || reviewCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check whether a course is enrollable
 */
const courseEnrollable = async (req: any, res: any, next: any) => {
    try {
        // Fetch the parameters required for the check.
        const course: any = await CoursesPS.executeGetCourseById(req.params.courseId);
        const activeYears: any[] = await CoursesPS.executeGetactiveAcademicYears();

        // Verify the authorization.
        const isEnrollable = course.enrollable;
        const isActive = activeYears.filter(activeYear => {return activeYear.year === course.academic_year; }).length > 0;

        await response(res, isEnrollable && isActive, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a checkbox question
 */
const checkCheckboxQuestionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationCheckboxQuestion(req.params.question_id, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to post checkbox option
 */
const checkCheckboxOptionPost = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationCheckboxQuestion(req.body.checkboxquestion_id, req.user.netid);
        await response(res, authCheck.exists, next);
    } catch (error) {
        res.sendStatus(401);
    }
};

/**
 * Check authorization to edit a checkbox option
 */
const checkCheckboxOptionEdit = async (req: any, res: any, next: any) => {
    try {
        const authCheck = await AuthorizationPS.executeAuthorizationCheckboxOption(req.params.option_id, req.user.netid);
        await response(res, authCheck.exists, next);
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
    employeeCheck,
    enrolledAssignmentCheck,
    getRubricCheck,
    checkOwnerReviewComment,
    checkReviewTAOrTeacher,
    checkReviewOwnerDone,
    checkReviewOwner,
    checkOpenQuestionEdit,
    checkRangeQuestionEdit,
    checkMCQuestionEdit,
    checkUploadQuestionEdit,
    checkMCOptionEdit,
    checkRubricAuthorizationPost,
    checkRubricAuthorizationPostQuestion,
    checkAuthorizationForReview,
    checkAuthorizationForCreatingReviewEvaluation,
    checkAuthorizationForGettingReviewEvaluation,
    enrolledCourseCheck,
    checkMCOptionPost,
    enrolledCourseTeacherCheck,
    isAuthorizedToViewGroup,
    enrolledAsTeacherAssignmentCheck,
    enrolledAsTeacherAssignmentCheckForPost,
    enrolledAsTAOrTeacherAssignment,
    enrolledAsStudentAssignment,
    getSubmissionAuth,
    postSubmissionAuth,
    getSubmissionFileAuth,
    getSubmissionCommentAuth,
    putSubmissionCommentAuth,
    checkRubricAuthorization,
    isAuthorizedToEditGroup,
    checkReviewEditAllowed,
    checkSubmissionBetweenPublishDue,
    enrolledAsTeacherTwoAssignmentsCheck,
    enrolledAsTeacherThreeAssignmentsCheck,
    courseEnrollable,
    enrolledAsTAOrTeacherCourse,
    checkCheckboxQuestionEdit,
    checkCheckboxOptionPost,
    checkCheckboxOptionEdit
};
