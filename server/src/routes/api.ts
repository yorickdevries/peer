import { Router } from "express";
import CoursesPS from "../prepared_statements/courses_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import ReviewPS from "../prepared_statements/review_ps";
import UserPS from "../prepared_statements/user_ps";
const router = Router();

/**
 * Route to get all assignments for a specific course.
 * @param course_id - course id.
 */
router.get("/assignments/:course_id", async (req, res) => {
    let re = await AssignmentPS.executeGetAssignments(req.params.course_id);
    res.json(re);
});

/**
 * Route to get an assignment for a specific course and assignment id.
 * @param assignment_id - assignment id.
 * @param assignment_id - assignment id to get.
 */
router.get("/assignment/:course_id/:assignment_id", async (req, res) => {
    res.json(await AssignmentPS.executeGetAssignmentById(req.params.course_id, req.params.assignment_id));
});

/**
 * Route to post an assignment with a title and description
 * @body course_id - course id.
 * @body assignment_id - assignment id.
 */
router.post("/assignment", async (req, res) => {
    res.json(await AssignmentPS.executeAddAssignment(req.body.assignment_title, req.body.assignment_description));
});

/**
 * Route to update an assignment with a title, description, course and assignment id.
 * @body assignment_title - assignment title.
 * @body assignment_description - assignment description.
 * @body course_id - course id.
 * @body assignment_id - assignment id.
 */
router.put("/assignment", async (req, res) => {
    res.json(await AssignmentPS.executeUpdateAssignmentById(
        req.body.assignment_title,
        req.body.assignment_description,
        req.body.course_id,
        req.body.assignment_id));
});


router.get('/courses', async (req, res) => {
    res.json(await CoursesPS.executeGetAllCourses());
});

router.get('/courses/:courseId', async (req, res) => {
    res.json(await CoursesPS.executeGetCourseById(req.params.courseId));
});

router.post('/courses', async (req, res) => {
    res.json(await CoursesPS.executeCreateCourse(req.body.description, req.body.name));
});

router.put('/courses', async (req, res) => {
    res.json(await CoursesPS.executeUpdateCourse(req.body.id, req.body.description, req.body.name));
});

router.get('/courses/:courseId/assignments', async (req, res) => {
    res.json(await CoursesPS.executeUpdateCourse(req.body.id, req.body.description, req.body.name));
});

router.post('/peer-reviews', async (req, res) => {
    res.json(await ReviewPS.executeCreateReview(req.body.comment, req.body.user_netid, req.body.submission_id, req.body.rubric_id));
});

export default router;
