// Imports
import path from "path";
import fs from "fs-extra";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import index from "../security/index";
import config from "../config";
import upload from "../middleware/upload";

// Router
import express from "express";

const router = express();
// Needed for the tests (tests need to change)
router.use(express.json());

// Function which adds the submission to the database.
const addSubmissionToDatabase = async function(req: any, res: any, next: any) {
    try {
        const fileFolder = config.submissions.fileFolder;
        const fileName = Date.now() + "-" + req.file.originalname;
        const filePath = path.join(fileFolder, fileName);
        const netId = req.user.netid;
        const assignmentId = req.body.assignmentId;
        // get the groupId of this user for this assignment
        const groupAssignment: any = await AssignmentPS.executeGetGroupOfNetIdByAssignmentId(netId, assignmentId);
        const groupId = groupAssignment.group_id;

        // add to database
        const result: any = await SubmissionsPS.executeCreateSubmission(netId, groupId, assignmentId, fileName);
        // writing the file if no error is there
        await fs.writeFile(filePath, req.file.buffer);
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
router.post("/", upload("submissionFile", config.allowed_extensions, config.submissions.maxSizeSubmissionFile), index.authorization.postSubmissionAuth, index.authorization.checkSubmissionBetweenPublishDue, addSubmissionToDatabase);

/**
 * Route to get a file from a submission.
 * @authorization user should part of the group which has submitted or the reviewer for the submission..
 * @param id - submission id.
 */
router.get("/:id/file", index.authorization.getSubmissionFileAuth, async (req, res) => {
    try {
        const submission: any = await SubmissionsPS.executeGetSubmissionById(req.params.id);
        const filePath = path.join(config.submissions.fileFolder, submission.file_path);
        res.download(filePath);
    } catch (err) {
        res.sendStatus(400);
    }
});

/**
 * Get all submission comments.
 * @authorization user should be TA, teacher or part of the group which has submitted.
 * @param id - an id of a submission.
 * @return database return value.
 */
router.get("/:id/allComments", index.authorization.getSubmissionAuth, (req, res) => {
    SubmissionsPS.executeGetAllSubmissionComments(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Put submission comments.
 * @authorization user should be TA, teacher or part of the group which has submitted.
 * @param submissionCommentId - an id of a submission.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.put("/:submissionCommentId/comment", index.authorization.putSubmissionCommentAuth, (req, res) => {
    SubmissionsPS.executeUpdateSubmissionComment(req.params.submissionCommentId, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Post all submission comments.
 * @authorization user should be TA, teacher or part of the group which has submitted.
 * @param id - an id of a submission.
 * @body netid - a netid.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.post("/:id/comment", index.authorization.getSubmissionAuth, (req: any, res) => {
    SubmissionsPS.executeAddSubmissionComment(req.params.id,  req.user.netid, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Delete submission comments.
 * @authorization user should be TA, teacher or part of the group which has submitted.
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