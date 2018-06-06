// Imports
import path from "path";
import fs from "fs";
import index from "../security/index";
import multer from "multer";
import AssignmentPS from "../prepared_statements/assignment_ps";
import UserPS from "../prepared_statements/user_ps";
import ReviewPS from "../prepared_statements/review_ps";
import GroupParser from "../groupParser";
import reviewDistribution from "../reviewDistribution";
import bodyParser from "body-parser";

// Router
import express from "express";
import SubmissionsPS from "../prepared_statements/submissions_ps";

const router = express();
router.use(bodyParser.json());

const fileFolder = path.join(__dirname, "../files/assignments");

// Upload settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // tslint:disable-next-line
        cb(null, fileFolder);
    },
    filename: function (req, file, cb) {
        // tslint:disable-next-line
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// PDF of max 30 MB (in bytes)
const maxSizeAssignmentFile = 30 * 1024 * 1024;
const uploadAssignment = multer({
    storage: storage,
    limits: {fileSize: maxSizeAssignmentFile},
    fileFilter: function (req: any, file, cb: any) {
        const ext = path.extname(file.originalname);
        if (ext !== ".pdf") {
            req.fileValidationError = "File should be a .pdf file";
            // tslint:disable-next-line
            return cb(null, false)
        }
        // tslint:disable-next-line
        cb(null, true);
    }
}).single("assignmentFile");


// CSV of max 1 MB (in bytes)
const maxSizeGroupsfile = 1 * 1024 * 1024;
// The file will be stored into the memory
const uploadGroups = multer({
    limits: {fileSize: maxSizeGroupsfile},
    fileFilter: function (req: any, file, cb: any) {
        const ext = path.extname(file.originalname);
        if (ext !== ".csv") {
            req.fileValidationError = "File should be a .csv file";
            // tslint:disable-next-line
            return cb(null, false)
        }
        // tslint:disable-next-line
        cb(null, true);
    }
}).single("groupFile");


/**
 * Route to get all the information about an assignment
 * @params assignment_id - assignment id
 */
router.route("/:assignment_id")
    .get(index.authorization.enrolledAssignmentCheck, async (req, res) => {
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
    .post(index.authorization.enrolledAsTeacherAssignmentCheckForPost, async (req: any, res, next) => {
            // File upload handling
            uploadAssignment(req, res, async function (err) {
                // Error in case of too large file size
                if (err) {
                    res.json({error: err});
                }
                // Error in case of wrong file type
                else if (req.fileValidationError) {
                    res.json({error: req.fileValidationError});
                } else {
                    const fileName = req.file.filename;
                    // add to database
                    res.json(await AssignmentPS.executeAddAssignment(
                        req.body.title,
                        req.body.description,
                        req.body.due_date,
                        req.body.publish_date,
                        req.body.course_id,
                        req.body.reviews_per_user,
                        fileName));
                }
            });
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
    .put(index.authorization.enrolledAsTeacherAssignmentCheckForPost, async (req, res) => {
            res.json(await AssignmentPS.executeUpdateAssignmentById(
                req.body.assignment_title,
                req.body.assignment_description,
                req.body.course_id,
                req.params.assignment_id));
    });

/**
 * Route to get a file from an assignment.
 * @param id - assignment id.
 */
router.get("/:id/file", async (req, res) => {
    const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.id);
    const fileName = path.join(__dirname, "../files/assignments", assignment.filename);
    res.sendfile(fileName);
});

/**
 * Route to get all submissions of a certain assignment of your specific group
 * @userinfo given_name - netId
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/submissions")
    .get(async (req: any, res) => {
        res.json(await AssignmentPS.executeGetSubmissionsByAssignmentId(
            req.userinfo.given_name,
            req.params.assignment_id
        ));
    });

/**
 * Route to get all the submissions per assignment
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/allsubmissions")
    .get(index.authorization.enrolledAsTAOrTeacherAssignment, async (req, res) => {
            res.json(await AssignmentPS.executeGetAllSubmissionsByAssignmentId(
                req.params.assignment_id
            ));
    });


/**
 * Route to request a list of reviews
 * @userinfo given_name - NetId
 * @params assignment_id - assignment_Id
 */
router.route("/:assignment_id/reviews")
    .get(async (req: any, res) => {
        res.json(await ReviewPS.executeGetReviewsByUserIdAndAssignmentId(req.userinfo.given_name, req.params.assignment_id));
    });

/**
 * Route to distribute reviews for a certain assignment
 */
router.route("/:assignment_id/distributeReviews")
    .get(async (req: any, res) => {
        res.json(await reviewDistribution.distributeReviews(req.params.assignment_id));
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

/**
 * Route to import groups for a specific assignment.
 */
router.post("/:id/importgroups", async (req: any, res) => {
    // File upload handling
    uploadGroups(req, res, async function (err) {
        // Error in case of wrong file type
        if (req.fileValidationError) {
            res.json({error: req.fileValidationError});
            // Error (in case of too large file size)
        } else if (err) {
            res.json({error: err});
            // error if no file was uploaded or no group column defined
        } else if (req.file == undefined) {
            res.json({error: "No file uploaded"});
        } else if (req.body.groupColumn == undefined) {
            res.json({error: "No groupcolumn defined"});
        } else {
            const groupColumn = req.body.groupColumn;
            const assignmentId = req.params.id;
            const groups = await GroupParser.importGroups(req.file.buffer, groupColumn, assignmentId);
            res.json(groups);
        }
    });
});

router.get("/:id/reviewCount", async (req: any, res) => {
    res.json(await AssignmentPS.executeCountAssignmentReviews(req.params.id, req.userinfo.given_name));
});

/**
 * Route to get the reviews belonging to an assignment.
 * @param id - assignment id.
 */
router.get("/:id/allreviews", async (req: any, res) => {
    res.json(await AssignmentPS.executeGetReviewsById(req.params.id));
});

/**
 * Route to get review Ids of a certain person.
 */
router.get("/:id/feedback", async (req: any, res) => {
    const assignmentId = req.params.id;
    console.log('assignment: ' +assignmentId);
    const group = await UserPS.executeGetGroupsByNetIdByAssignmentId(req.userinfo.given_name, req.params.id);
    const groupId = group.group_groupid;
    console.log('group: ' + groupId);
    const submission = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentIdByGroupId(assignmentId, groupId);
    const submissionId = submission.id;
    console.log('submission: ' + submissionId);
    res.json(await ReviewPS.executeGetReviewsByGroupIdAndAssignmentId(submissionId));
});

export default router;