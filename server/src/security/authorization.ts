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
const enrolledAssignmentCheck = async (req, res, next) => {
    const assignment = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
    return await AuthorizationPS.executeCheckEnrollment(assignment.course_id, req.userinfo.given_name);
};





export default authorizeCheck;