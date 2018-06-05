// Imports
import path from "path";
import fs from "fs";
import multer from "multer";
import SubmissionsPS from "../prepared_statements/submissions_ps";

// Router
import { Router } from "express";
const router = Router();

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
const maxSize = 30 * 1024 * 1024;
const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
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
}).single("submissionFile");

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

router.post("/", async (req: any, res) => {
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
            // make path here
            const netId = req.userinfo.given_name;
            const groupId = req.body.groupId;
            const assignmentId = req.body.assignmentId;
            const fileName = req.file.filename;
            const date = new Date();
            // add to database
            res.json(await SubmissionsPS.executeCreateSubmission(netId, groupId, assignmentId, fileName, date));
        }
    });
});

/**
 * Route to get a file from a submission.
 * @param id - submission id.
 */
router.get("/:id/file", async (req, res) => {
    const submission: any = await SubmissionsPS.executeGetSubmissionById(req.params.id);
    const filePath = path.join(__dirname, "../files/submissions", submission.file_path);
    res.sendfile(filePath);
});

export default router;