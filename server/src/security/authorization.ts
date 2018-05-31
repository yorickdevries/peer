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
  }  else {
      res.sendStatus(401);
  }
};

/**
 * Check whether a user is enrolled to the course of the assignment it wants to access
 */
const enrolledAssignmentCheck = async (req: any, res: any) => {
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    console.log(assignment.course_id);
    console.log(req.userinfo.given_name);
    return await AuthorizationPS.executeCheckEnrollment(assignment.course_id, req.userinfo.given_name);
};

/**
 * Check whether a user in enrolled as teacher
 */
const enrolledAsTeacherAssignmentCheck = async (req: any, res: any) => {
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    return await AuthorizationPS.executeCheckEnrollmentAsTeacher(assignment.course_id, req.userinfo.given_name);
};

/**
 * Check whether a user in enrolled as teacher for post and put
 */
const enrolledAsTeacherAssignmentCheckForPost = async (req: any, res: any) => {
    return await AuthorizationPS.executeCheckEnrollmentAsTeacher(req.body.course_id, req.userinfo.given_name);
};

/**
 * Check enrollment of a user as teacher or ta for a given course
 */
const enrolledAsTAOrTeacherAssignment = async (req: any, res: any) => {
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    return await AuthorizationPS.executeCheckEnrollAsTAOrTeacher(assignment.course_id, req.userinfo.given_name);
};




export default {
    authorizeCheck,
    enrolledAssignmentCheck,
    enrolledAsTeacherAssignmentCheck,
    enrolledAsTeacherAssignmentCheckForPost,
    enrolledAsTAOrTeacherAssignment
};
