import { Router } from "express";
import CoursesPS from "../prepared_statements/courses_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import UserPS from "../prepared_statements/user_ps";
const router = Router();

/**
 * Route to get all assignments for a specific course.
 * @param course_id - course id.
 */
router.get("/assignments/:course_id", async (req, res) => {
    res.json(await AssignmentPS.executeGetAssignments(req.params.course_id));
});

/**
 * Route to get an assignment for a specific course and assignment id.
 * @param course_id - course id.
 * @param assignment_id - assignment id to get.
 */
router.get("/assignment/:course_id/:assignment_id", async (req, res) => {
    res.json(await AssignmentPS.executeGetAssignmentById(req.params.course_id, req.params.assignment_id));
});

/**
 * Route to post and update an assignment.
 * @body assignment_title - assignment title.
 * @body assignment_description - assignment description.
 * @body course_id - course id.
 * @body assignment_id - assignment id.
 */
router.route("/assignment")
    .post(async (req, res) => {
        res.json(await AssignmentPS.executeAddAssignment(
            req.body.assignment_title,
            req.body.assignment_description));
    })
    .put(async (req, res) => {
        res.json(await AssignmentPS.executeUpdateAssignmentById(
            req.body.assignment_title,
            req.body.assignment_description,
            req.body.course_id,
            req.body.assignment_id));
    });

export default router;
