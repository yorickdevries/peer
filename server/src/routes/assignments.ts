import AssignmentPS from "../prepared_statements/assignment_ps";

// Router
import { Router } from "express";
const router = Router();

/**
 * Route to get all the information about an assignment
 * @params assignment_id - assignment id
 */
router.route("/:assignment_id")
    .get(async (req, res) => {
        res.json(await AssignmentPS.executeGetAssignmentById(
            req.params.assignment_id
        ));
    });


/**
 * Route to post and update an assignment.
 * @body assignment_title - assignment title.
 * @body assignment_description - assignment description.
 * @params course_id - course id.
 * @body assignment_id - assignment id.
 * @body due_date - due date.
 * @body publish_date - publish date.
 */
router.route("/")
    .post(async (req, res) => {
        res.json(await AssignmentPS.executeAddAssignment(
            req.body.assignment_title,
            req.body.assignment_description,
            req.body.assignment_due_date,
            req.body.assignment_publish_date,
            req.body.course_id));
    });


/**
 * Route to update an assignment.
 * @body assignment_title - assignment title.
 * @body assignment_description - assignment description.
 * @params course_id - course id.
 * @body assignment_id - assignment id.
 * @body due_date - due date.
 * @body publish_date - publish date.
 */
router.route("/:assignment_id")
    .put(async (req, res) => {
        res.json(await AssignmentPS.executeUpdateAssignmentById(
            req.body.assignment_title,
            req.body.assignment_description,
            req.body.course_id,
            req.params.assignment_id));
    });

router.route("/:assignment_id/submssion")
    .get(async (req: any, res) => {
        res.json(await AssignmentPS.executeGetSubmissionByAssignmentId(
            req.userinfo.given_name,
            req.params.assignment_id
        ));
    });


export default router;