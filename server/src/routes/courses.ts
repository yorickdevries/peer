import CoursesPS from "../prepared_statements/courses_ps";
import router from "./api";

/**
 * Route to get information for a specific course.
 * @param course_id - courseId
 */
router.get("/courses/:courseId", async (req, res) => {
    res.json(await CoursesPS.executeGetCourseById(req.params.courseId));
});


/**
 * Route to update a course
 * Route that creates a new course
 * Route to get all courses.
 * @body id - id
 * @body description - description
 * @body name - name
 */
router.route("/courses").put(async (req, res) => {
    res.json(await CoursesPS.executeUpdateCourse(req.body.id, req.body.description, req.body.name));
}).post(async (req, res) => {
    res.json(await CoursesPS.executeCreateCourse(req.body.description, req.body.name));
}).get(async (req, res) => {
    res.json(await CoursesPS.executeGetAllCourses());
});

/**
 * Route that gets all assignments of a course.
 * @param courseId - courseId
 */
router.get("/courses/:courseId/assignments", async (req, res) => {
    res.json(await CoursesPS.executeGetAssignmentByCourseId(req.params.courseId));
});

export default router;