import AuthorizationPS from "../prepared_statements/authorization_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";

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
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    const authCheck = await AuthorizationPS.executeCheckEnrollment(assignment.course_id, req.userinfo.given_name);
    await response(res, authCheck.exists, next);
};

/**
 * Check whether a user in enrolled as teacher
 */
const enrolledAsTeacherAssignmentCheck = async (req: any, res: any, next: any) => {
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.userinfo.given_name);
    await response(res, authCheck.exists, next);
};

/**
 * Check whether a user in enrolled as teacher for post and put
 */
const enrolledAsTeacherAssignmentCheckForPost = async (req: any, res: any, next: any) => {
    const authCheck = await AuthorizationPS.executeCheckEnrollmentAsTeacher(req.body.course_id, req.userinfo.given_name);
    await response(res, authCheck.exists, next);
};

/**
 * Check enrollment of a user as teacher or ta for a given course
 */
const enrolledAsTAOrTeacherAssignment = async (req: any, res: any, next: any) => {
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    const authCheck = await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.userinfo.given_name);
    await response(res, authCheck.exists, next);
};

const isAuthorizedToViewGroup = async (req: any, res: any, next: any) => {
    console.log(req.userinfo.given_name);
    console.log(req.params.id);
    const authCheckTATeacher = await AuthorizationPS.isTAOrTeacherForGroup(req.userinfo.given_name, req.params.id);
    const authCheckStudent = await AuthorizationPS.isInGroup(req.userinfo.given_name, req.params.id);
    console.log(authCheckTATeacher.exists);
    console.log(authCheckStudent.exists);
    const authCheck = authCheckTATeacher.exists || authCheckStudent.exists;
    await response(res, authCheck, next);
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
    enrolledAsTeacherAssignmentCheck,
    isAuthorizedToViewGroup,
    enrolledAsTeacherAssignmentCheckForPost,
    enrolledAsTAOrTeacherAssignment
};
