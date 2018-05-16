import { Router } from "express";
import CoursesPS from "../prepared_statements/courses_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import UserPS from "../prepared_statements/user_ps";
const router = Router();


/**
 * Route to get all assignments for a specific course.
 * @body course_id - course id.
 */
router.get("/assignments", async (req, res) => {
    res.json(await AssignmentPS.executeGetAssignments(req.body.course_id));
});

/**
 * Route to get an assignment for a specific course and assignment id.
 * @body course_id - course id.
 * @body assignment_id - assignment id to get.
 */
router.get("/assignment", async (req, res) => {
    res.json(await AssignmentPS.executeAddAssignment(req.body.course_id, req.body.assignment_id));
});

/**
 * Route to post an assignment with a title and description
 * @body course_title - assignment title.
 * @body course_description - assignment description.
 */
router.post("/assignment", async (req, res) => {
    res.json(await AssignmentPS.executeGetAssignmentById(req.body.course_title, req.body.course_description));
});

export default router;
