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
            req.body.title,
            req.body.description,
            req.body.due_date,
            req.body.publish_date,
            req.body.course_id,
            req.body.filename));
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
            req.params.assignment_id,
            req.body.filename));
    });


/**
 * Route to get an subbission of someone's assignment
 * @userinfo given_name - netId
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/submssion")
    .get(async (req: any, res) => {
        res.json(await AssignmentPS.executeGetSubmissionByAssignmentId(
            req.userinfo.given_name,
            req.params.assignment_id
        ));
    });

/**
 * Route to get all the submissions per assignment
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/allsubmissions")
    .get(async (req, res) => {
        res.json(await AssignmentPS.executeGetAllSubmissionsByAssignmentId(
            req.params.assignment_id
        ));
    });


/**
 * Route to request a review, returns a review object
 * @userinfo given_name - NetId
 * @params assignment_id - assignment_Id
 */
router.route("/:assignment_id/requestReview")
    .get(async (req: any, res) => {
        res.json(await AssignmentPS.executeCreateReviewByAssignmentId(
            req.userinfo.given_name,
            0, // HERE THE SHUFFLING NEEDS TO BE DONE
            req.params.assignment_id
        ));
    });


/**
 * Route to request the review a user is working on
 * @userinfo given_name - netId
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/review")
    .get(async (req: any, res) => {
        res.json(await AssignmentPS.executeGetReviewByAssignmentId(
            req.params.assignment_id,
            req.userinfo.given_name
        ));
    });

export default router;