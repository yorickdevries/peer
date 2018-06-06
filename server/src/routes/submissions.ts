// Imports
import path from "path";
import fs from "fs";
import multer from "multer";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import bodyParser from "body-parser";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());

const fileFolder = path.join(__dirname, "../files/submissions");

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
            res.json({ error: err });
        }
        // Error in case of no file
        else if (req.file == undefined) {
            res.json({ error: "No file uploaded" });
        }
        // Error in case of wrong file type
        else if (req.fileValidationError) {
            res.json({ error: req.fileValidationError });
        } else {
            next();
        }
    });
};

// Function which adds the submission to the database.
const addSubmissionToDatabase = async function(req: any, res: any, next: any) {
    const fileFolder = path.join(__dirname, "../files/submissions");
    const fileName = Date.now() + "-" + req.file.originalname;
    const filePath = path.join(fileFolder, fileName);
    const netId = req.userinfo.given_name;
    const assignmentId = req.body.assignmentId;
    const groupId = req.body.groupId;
    const date = new Date();

    // add to database
    const result: any = await SubmissionsPS.executeCreateSubmission(netId, groupId, assignmentId, fileName, date);
    // writing the file if no error is there
    if (!result.error) {
        fs.writeFile(filePath, req.file.buffer, (err) => {
            if (err) {
                res.json({error: err});
            }
            console.log("The file has been saved at" + filePath);
        });
    }
    res.json(result);
};

/**
 * Route to get all submissions.
 */
router.get("/", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissions());
});

/**
 * Route to get one submission with a specific id.
 * @param id - submission id.
 */
router.get("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissionById(req.params.id));
});

/**
 * Route to delete one submission with a specific id.
 * @param id - submission id.
 */
router.delete("/:id", async (req, res) => {
    const result: any = await SubmissionsPS.executeDeleteSubmissionById(req.params.id);
    // In case the query was succesful
    if (result.file_path) {
        const filePath = path.join(__dirname, "../files/submissions", result.file_path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log(filePath + "was deleted");
            }
          });
        res.json(result);
    } else {
        res.json(result);
    }
});

/**
 * Route to make a new submission.
 */
router.post("/", uploadSubmissionFunction, addSubmissionToDatabase);

/**
 * Route to get a file from a submission.
 * @param id - submission id.
 */
router.get("/:id/file", async (req, res) => {
    const submission: any = await SubmissionsPS.executeGetSubmissionById(req.params.id);
    const filePath = path.join(__dirname, "../files/submissions", submission.file_path);
    res.sendfile(filePath);
});

/**
 * Get all review comments.
 * @param submissionId - an id of a submission.
 * @return database return value.
 */
router.get("/:submissionId/allComments", async (req, res) => {
    res.json(await SubmissionsPS.executeGetAllSubmissionComments(req.params.submissionId));
});

/**
 * Get all review comments.
 * @param submissionId - an id of a submission.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.put("/:submissionCommentId/comment", async (req, res) => {
    res.json(await SubmissionsPS.executeUpdateSubmissionComment(req.params.submissionId, req.body.comment));
});

/**
 * Get all review comments.
 * @param submissionId - an id of a submission.
 * @body netid - a netid.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.post("/:submissionId/comment", async (req, res) => {
    res.json(await SubmissionsPS.executeAddSubmissionComment(req.params.submissionId, req.body.netid, req.body.comment));
});

/**
 * Get all review comments.
 * @param submissionId - an id of a submission.
 * @return database return value.
 */
router.delete("/:submissionCommentId/comment", async (req, res) => {
    res.json(await SubmissionsPS.executeDeleteSubmissionComment(req.params.submissionId));
});

export default router;