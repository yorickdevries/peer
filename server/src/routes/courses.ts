import CoursesPS from "../prepared_statements/courses_ps";
import bodyParser from "body-parser";
import { Roles } from "../roles";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());

/**
 * Route to update a course
 * Route that creates a new course
 * Route to get all courses.
 * @body description - description
 * @body name - name
 */
router.route("/").post(async (req: any, res) => {
    // Create the course
    const course = await CoursesPS.executeCreateCourse(req.body.description, req.body.name);
    // Enroll the teacher in the course
    await CoursesPS.executeEnrollInCourseId(course.id, req.userinfo.given_name, Roles.teacher);
    // Respond with appropriate JSON
    res.json(course);
}).get(async (req, res) => {
    res.json(await CoursesPS.executeGetAllCourses());
});

/**
 * Router to get all courses you are enrolled in
 */
router.get("/enrolled", async (req: any, res) => {
   res.json(await CoursesPS.executeGetAllEnrolledCourses(req.userinfo.given_name));
});

/**
 * Get all assignments that belong to a specific course.
 * @param courseId - a course id.
 */
router.get("/:courseId/assignments", async (req, res) => {
    res.json(await CoursesPS.executeGetAssignmentsByCourseId(req.params.courseId));
});

/**
 * Update the course, given a course id.
 * @param courseId - course id.
 * @body description - a new course description.
 * @body name - a new course name.
 */
router.put("/:courseId", async (req, res) => {
    res.json(await CoursesPS.executeUpdateCourse(req.params.courseId, req.body.description, req.body.name));
});

/**
 * Route to get information for a specific course.
 * @param courseId - course id.
 */
router.get("/:courseId", async (req, res) => {
    res.json(await CoursesPS.executeGetCourseById(req.params.courseId));
});

/**
 * Route to get information about the role of a user in a specific course.
 * @param course_id - course id.
 */
router.get("/:courseId/role", async (req: any, res) => {
    res.json(await CoursesPS.executeGetRoleById(req.userinfo.given_name, req.params.courseId));
});

export default router;