import ReviewsPS from "../prepared_statements/review_ps";
import ReviewUpdate from "../reviewUpdate";
import bodyParser from "body-parser";
import index from "../security/index";
import path from "path";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());


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
router.route("/:reviewId").put(index.authorization.checkReviewOwner, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const inputForm = req.body.form;
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
router.route("/:reviewId/submit").get(index.authorization.checkReviewOwnerDone, (req, res) => {
    ReviewsPS.executeSubmitReview(req.params.reviewId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
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
    ReviewsPS.executeAddReviewComment(req.params.reviewId, req.userinfo.given_name, req.body.comment)
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
        const filePath = path.join(__dirname, "../files/submissions", submission.file_path);
        res.sendfile(filePath);
    } catch (err) {
        res.sendStatus(400);
    }
});

export default router;