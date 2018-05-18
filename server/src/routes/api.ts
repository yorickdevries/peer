import { Router } from "express";
import CoursesPS from "../prepared_statements/courses_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import ReviewPS from "../prepared_statements/review_ps";
import UserPS from "../prepared_statements/user_ps";
// import database object
import Database from "../database";
// okta-login
import session from "express-session";
import { oidc } from "../express-oidc";

const router = Router();

// Okta login
// session support is required to use ExpressOIDC
// needs a random secret
router.use(session({
    secret: "add something random here",
    resave: true,
    saveUninitialized: false
  }));

// Login/login-redirect route from OIDC
router.use(oidc.router);

router.get("/logout", (req: any, res) => {
    req.logout();
    res.redirect("/");
  });

// Authentication route
router.get("/authenticated", function (req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

// Only logged in users can access the API
router.use(function (req: any, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.userinfo.given_name + " accesses the API");
        next();
    } else {
        next(new Error("Not Authenticated"));
    }
});

router.get("/user", function (req: any, res, next) {
    res.json({
        user: req.userinfo
    });
});

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
 * @body due_date - due date.
 * @body publish_date - publish date.
 */
router.route("/assignment")
    .post(async (req, res) => {
        res.json(await AssignmentPS.executeAddAssignment(
            req.body.assignment_title,
            req.body.assignment_description,
            req.body.assignment_due_date,
            req.body.assignment_publish_date,
            req.body.course_id));
    })
    .put(async (req, res) => {
        res.json(await AssignmentPS.executeUpdateAssignmentById(
            req.body.assignment_title,
            req.body.assignment_description,
            req.body.course_id,
            req.body.assignment_id));
    });


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

/**
 * Route that creates a new review
 * @body comment - comment
 * @body user_netId - user_netId
 * @body submission_id - submission_id
 * @body rubric_id - rubric_id
 */
router.post("/peer-reviews", async (req, res) => {
    res.json(await ReviewPS.executeCreateReview(req.body.comment, req.body.user_netid, req.body.submission_id));
});

export default router;
