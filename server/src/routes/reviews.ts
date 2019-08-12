import ReviewsPS from "../prepared_statements/review_ps";
import ReviewUpdate from "../reviewUpdate";
import bodyParser from "body-parser";
import index from "../security/index";
import path from "path";
import multer from "multer";
import config from "../config";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());


// File of max 30 MB (in bytes)
const maxSizeAssignmentFile = config.assignments.maxSizeAssignmentFile;
const uploadReview = multer({
    limits: {fileSize: maxSizeAssignmentFile},
    fileFilter: function (req: any, file, callback) {
        const ext = path.extname(file.originalname);
        const extensions: any = config.allowed_extensions;
        if (!(extensions.includes(ext))) {
            req.fileValidationError = "Extension not allowed";
            // tslint:disable-next-line
            return callback(null, false);
        } else {
            // tslint:disable-next-line
            return callback(null, true);
        }
    }
}).single("assignmentFile");

// File upload handling
const uploadReviewFunction = function(req: any, res: any, next: any) {
    uploadReview(req, res, function (err) {
        // Error in case of too large file size
        if (err) {
            res.status(400);
            res.json({ error: "File is too large" });
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

/**
 * Route to get a review by review id.
 * @param reviewId - a review id.
 * @return a database query result, all columns of review + file_path of the submission.
 */
router.route("/:reviewId").get(index.authorization.checkAuthorizationForReview, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const result = await ReviewUpdate.getReview(reviewId);
        res.json(result);
    } catch (error) {
        res.status(400);
        res.json({error: error.message});
    }
});

/**
 * Route to update or insert and answer by review id.
 * @body a json object of the whole form, as specified in the doc.
 * @return JSON representation of a review.
 */
router.route("/:reviewId").put(uploadReviewFunction, index.authorization.checkReviewOwner, index.authorization.checkReviewBetweenPublishDue, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const inputForm = JSON.parse(req.body.form);
        const result = await ReviewUpdate.updateReview(reviewId, inputForm);
        res.json(result);
    } catch (error) {
        res.status(400);
        res.json({error: error.message});
    }
});

/**
 * Submit a review by id.
 * @param reviewId - an id of a review.
 * @return database return value.
 */
router.route("/:reviewId/submit").get(index.authorization.checkReviewOwnerDone, index.authorization.checkReviewBetweenPublishDue, async (req, res) => {
    const reviewId = req.params.reviewId;
    const reviewFilled = await ReviewUpdate.isCompletelyFilledIn(reviewId);
    if (reviewFilled) {
        const result = await ReviewsPS.executeSubmitReview(reviewId);
        res.json(result);
    } else {
        res.status(400);
        res.json({error: "Review not completely filled in"});
    }
});

/**
 * Unsubmit a review by id.
 * @param reviewId - an id of a review.
 * @return database return value.
 */
router.route("/:reviewId/unsubmit").get(index.authorization.checkReviewOwnerDone, index.authorization.checkReviewBetweenPublishDue, async (req, res) => {
    const reviewId = req.params.reviewId;
    const result = await ReviewsPS.executeUnSubmitReview(reviewId);
    res.json(result);
});

/**
 * Get all review comments.
 * @param reviewId - an id of a review.
 * @return database return value.
 */
router.route("/:reviewId/allComments").get(index.authorization.checkAuthorizationForReview, (req, res) => {
    ReviewsPS.executeGetAllReviewComments(req.params.reviewId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Update a review comment by its id.
 * @param reviewId - an id of a review.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.route("/:reviewCommentId/comment").put(index.authorization.checkOwnerReviewComment, (req, res) => {
    ReviewsPS.executeUpdateReviewComment(req.params.reviewCommentId, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Post review comment for a review id.
 * @param reviewId - an id of a review.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.route("/:reviewId/comment").post(index.authorization.checkReviewTAOrTeacher, (req: any, res) => {
    ReviewsPS.executeAddReviewComment(req.params.reviewId, req.user.netid, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Delete a review comment by review comment id.
 * @param reviewId - an id of a review.
 * @return database return value.
 */
router.route("/:reviewCommentId/comment").delete(index.authorization.checkOwnerReviewComment, (req, res) => {
    ReviewsPS.executeDeleteReviewComment(req.params.reviewCommentId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Gets the file that needs to be reviewed.
 */
router.route("/:reviewId/file").get(index.authorization.checkAuthorizationForReview, async (req, res) => {
    try {
        const submission: any = await ReviewsPS.executeGetSubmissionByReviewId(req.params.reviewId);
        const filePath = path.join(config.submissions.fileFolder, submission.file_path);
        res.download(filePath);
    } catch (err) {
        res.sendStatus(400);
    }
});

/**
 * Grade a specific review by approving or disproving (true/false).
 */
router.post("/:reviewId/grade", index.authorization.checkReviewTAOrTeacher, async (req: any, res) => {
    try {
        await ReviewsPS.executeSetApprovedForReview(req.body.approved, req.params.reviewId, req.user.netid);
        res.sendStatus(200);
    } catch {
        res.sendStatus(400);
    }
});

export default router;