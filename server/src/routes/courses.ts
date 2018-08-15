import CoursesPS from "../prepared_statements/courses_ps";
import AssignmentsPS from "../prepared_statements/assignment_ps";
import bodyParser from "body-parser";
import GroupParser from "../groupParser";
import index from "../security/index";
import { Roles } from "../roles";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());

/**
 * Route that creates a new course.
 * Route to get all courses.
 * @body description - description.
 * @body name - name.
 */
router.post("/", async (req: any, res) => {
    try {
        // Create the course
        const course = await CoursesPS.executeCreateCourse(req.body.description, req.body.name);
        // Enroll the teacher in the course
        await CoursesPS.executeEnrollInCourseId(course.id, req.userinfo.given_name, Roles.teacher);
        // Respond with appropriate JSON
        res.json(course);
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to get all courses.
 */
router.get("/", (req, res) => {
    CoursesPS.executeGetAllCourses()
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Router to get all courses you are enrolled in
 */
router.get("/enrolled", (req: any, res) => {
   CoursesPS.executeGetAllEnrolledCourses(req.userinfo.given_name)
   .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Get all assignments that belong to a specific course.
 * @param courseId - a course id.
 */
router.get("/:courseId/assignments", index.authorization.enrolledCourseCheck, (req, res) => {
    AssignmentsPS.executeGetAssignments(req.params.courseId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Update the course, given a course id.
 * @param courseId - course id.
 * @body description - a new course description.
 * @body name - a new course name.
 */
router.put("/:courseId", index.authorization.enrolledCourseTeacherCheck, (req, res) => {
    CoursesPS.executeUpdateCourse(req.params.courseId, req.body.description, req.body.name)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to get information for a specific course.
 * @param courseId - course id.
 */
router.get("/:courseId", index.authorization.enrolledCourseCheck, (req, res) => {
    CoursesPS.executeGetCourseById(req.params.courseId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to get information about the role of a user in a specific course.
 * @param course_id - course id.
 */
router.get("/:courseId/role", index.authorization.enrolledCourseCheck, async (req: any, res) => {
    CoursesPS.executeGetRoleById(req.userinfo.given_name, req.params.courseId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to set the role of a user for a course.
 * @param courseId - course id.
 * @body netid - a net id of a user to promote.
 * @body role - a new role for the user.
 * @return json containing { courseId: number, role: Role }
 */
router.put("/:courseId/setRole", index.authorization.enrolledCourseTeacherCheck, async (req: any, res) => {
    try {
        // Check if the role to upgrade to is valid.
        if (!(req.body.role in Roles)) {
            throw new Error("Invalid role");
        }
        // Fetch enrollments of the user to set the role from.
        const enrolled: any = await CoursesPS.executeExistsEnrolledByCourseIdUserById(req.params.courseId, req.body.netid);

        // Check if the student is enrolled in the course.
        const isEnrolled: boolean = enrolled.exists;

        // Depending if the student is enrolled, update the role of the student.
        let enroll: any;
        if (!isEnrolled) {
            enroll =  await CoursesPS.executeEnrollInCourseId(req.params.courseId, req.body.netid, req.body.role);
        } else {
            enroll = await CoursesPS.executeSetRole(req.params.courseId, req.body.netid, req.body.role);
        }
        res.json({ courseId: enroll.course_id, role: enroll.role });
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to fetch, for a specific course, all net ids with a given role.
 * @return json with an array of all net ids.
 */
router.get("/:courseId/users/:role/", index.authorization.enrolledCourseTeacherCheck, async (req: any, res) => {
    try {
        // Check if the role is valid and supported.
        if (!(req.params.role in Roles)) {
            throw new Error("Invalid role");
        }
        // Query and return all net ids as json.
        res.json(await CoursesPS.executeGetUsersByRole(req.params.courseId, req.params.role));
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Enroll as a student in a course.
 * @param courseId - a course id.
 */
router.get("/:courseId/enroll", async (req: any, res) => {
    try {
        // Use method from group parser to enroll student (if not already enrolled)
        await GroupParser.enrollStudentIfNotEnrolled(req.params.courseId, req.userinfo.given_name)
    } catch {
        res.sendStatus(400);
    }
});

export default router;