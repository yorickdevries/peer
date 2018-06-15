// Imports
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import bodyParser from "body-parser";
import AssignmentPS from "../prepared_statements/assignment_ps";
import index from "../security/index";

// Router
import express from "express";

const router = express();
router.use(bodyParser.json());

// PDF of max 30 MB (in bytes)
const maxSizeSubmissionFile = 30 * 1024 * 1024;
const uploadSubmission = multer({
    limits: {fileSize: maxSizeSubmissionFile},
    fileFilter: function (req: any, file, callback) {
        const ext = path.extname(file.originalname);
        if (ext !== ".pdf") {
            req.fileValidationError = "File should be a .pdf file";
            // tslint:disable-next-line
            return callback(null, false);
        } else {
            // tslint:disable-next-line
            return callback(null, true);
        }
    }
}).single("submissionFile");

// File upload handling
const uploadSubmissionFunction = function(req: any, res: any, next: any) {
    uploadSubmission(req, res, function (err) {
        // Error in case of too large file size
        if (err) {
            res.status(400);
            res.json({ error: "File is too large" });
        }
        // Error in case of no file
        else if (req.file == undefined) {
            res.status(400);
            res.json({ error: "No file uploaded" });
        }
        // Error in case of wrong file type
        else if (req.fileValidationError) {
            res.status(400);
            res.json({ error: req.fileValidationError });
        } else {
            next();
        }
    });
};

// Function which adds the submission to the database.
const addSubmissionToDatabase = async function(req: any, res: any, next: any) {
    try {
        const fileFolder = path.join(__dirname, "../files/submissions");
        const fileName = Date.now() + "-" + req.file.originalname;
        const filePath = path.join(fileFolder, fileName);
        const netId = req.userinfo.given_name;
        const assignmentId = req.body.assignmentId;
        const date = new Date();
        // get the groupId of this user for this assignment
        const groupAssignment: any = await AssignmentPS.executeGetGroupOfNetIdByAssignmentId(netId, assignmentId);
        const groupId = groupAssignment.group_id;

        // add to database
        const result: any = await SubmissionsPS.executeCreateSubmission(netId, groupId, assignmentId, fileName, date);
        // writing the file if no error is there
        fs.writeFileSync(filePath, req.file.buffer);
        res.json(result);
    } catch (err) {
        res.status(400);
        res.json({ error: "An error occurred while creating the submission" });
    }
};

/**
 * Route to get one submission with a specific id.
 * @param id - submission id.
 * @authorization user should be TA, teacher or part of the group which has submitted.
 */
router.get("/:id", index.authorization.getSubmissionAuth, (req, res) => {
    SubmissionsPS.executeGetSubmissionById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to make a new submission.
 * @authorization the user should be part of a group in the course.
 */
router.post("/", index.authorization.postSubmissionAuth, uploadSubmissionFunction, addSubmissionToDatabase);

/**
 * Route to get a file from a submission.
 * @param id - submission id.
 */
router.get("/:id/file", index.authorization.getSubmissionFileAuth, async (req, res) => {
    try {
        const submission: any = await SubmissionsPS.executeGetSubmissionById(req.params.id);
        const filePath = path.join(__dirname, "../files/submissions", submission.file_path);
        res.sendfile(filePath);
    } catch (err) {
        res.sendStatus(400);
    }
});

/**
 * Get all review comments.
 * @param submissionId - an id of a submission.
 * @return database return value.
 */
router.get("/:submissionId/allComments", (req, res) => {
    SubmissionsPS.executeGetAllSubmissionComments(req.params.submissionId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Get all review comments.
 * @param submissionCommentId - an id of a submission.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.put("/:submissionCommentId/comment", (req, res) => {
    SubmissionsPS.executeUpdateSubmissionComment(req.params.submissionCommentId, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Get all review comments.
 * @param submissionId - an id of a submission.
 * @body netid - a netid.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.post("/:submissionId/comment", (req, res) => {
    SubmissionsPS.executeAddSubmissionComment(req.params.submissionId, req.body.netid, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Get all review comments.
 * @param submissionCommentId - an id of a submission.
 * @return database return value.
 */
router.delete("/:submissionCommentId/comment", (req, res) => {
    SubmissionsPS.executeDeleteSubmissionComment(req.params.submissionCommentId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

export default router;