// Imports
import path from "path";
import fs from "fs";
import multer from "multer";
import AssignmentPS from "../prepared_statements/assignment_ps";

// Router
import express from "express";
const router = express();

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
const maxSize = 30 * 1024 * 1024;
const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req: any, file, cb: any) {
        if (file.mimetype !== "application/pdf") {
            req.fileValidationError = "File should be a .pdf file";
            // tslint:disable-next-line
            return cb(null, false, new Error("File should be a .pdf file"));
        }
        // tslint:disable-next-line
        cb(null, true);
    }
}).single("assignmentFile");

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
    .post(async (req: any, res) => {
        // File upload handling
        upload(req, res, async function (err) {
            // Error in case of too large file size
            if (err) {
                res.json({ error: err });
            }
            // Error in case of wrong file type
            else if (req.fileValidationError) {
                res.json({ error: req.fileValidationError });
            } else {
                const fileName = req.file.filename;
                // add to database
                res.json(await AssignmentPS.executeAddAssignment(
                    req.body.title,
                    req.body.description,
                    req.body.due_date,
                    req.body.publish_date,
                    req.body.course_id,
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
    .put(async (req, res) => {
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
 * Route to get an subbission of someone's assignment
 * @userinfo given_name - netId
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/submission")
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

router.get("/assignments/:id/review", async (req: any, res) => {
    res.json(await AssignmentPS.executeCountAssignmentReviews(req.params.id, req.userinfo.given_name));
});

export default router;