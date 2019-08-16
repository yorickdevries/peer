import ReviewsPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import ReviewUpdate from "../reviewUpdate";
import bodyParser from "body-parser";
import index from "../security/index";
import path from "path";
import multer from "multer";
import fs from "fs-extra";
import config from "../config";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());

const fileFolder = config.reviews.fileFolder;

// File of max 30 MB (in bytes)
const maxSizeAssignmentFile = config.reviews.maxSizeReviewFile;
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
}).any();

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
 * Route to make a review evaluation for a specific review
 */
router.route("/:reviewId/reviewevaluation").get(index.authorization.checkAuthorizationForGettingReviewEvaluation, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const reviewEvaluation: any = await ReviewsPS.executeGetReviewEvaluation(reviewId);
        res.json({
            id: reviewEvaluation.id,
            user_netid: reviewEvaluation.net_id
            });
    } catch (error) {
        res.status(400);
        res.json({error: error.message});
    }
});

/**
 * Route to make a review evaluation for a specific review
 */
router.route("/:reviewId/reviewevaluation").post(index.authorization.checkAuthorizationForCreatingReviewEvaluation, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const reviewEvaluationExists: any = await ReviewsPS.executeCheckExistsReviewEvaluation(reviewId);
        if (reviewEvaluationExists.exists) {
            throw new Error("Review evaluation already exists");
        } else {
            const review =  await ReviewsPS.executeGetReview(reviewId);
            const submissionRubric = await RubricPS.executeGetRubricById(review.rubric_id);
            const assignmentId = submissionRubric.assignment_id;

            // get the rubric belonging to the reviewEvaluation
            const reviewEvaluationRubric = await RubricPS.executeGetReviewEvaluationRubricByAssignmentId(assignmentId);

            // create the review
            const reviewEvaluation: any = await ReviewsPS.executeCreateReviewEvaluation(req.user.netid, reviewId, reviewEvaluationRubric.id);
            res.json(reviewEvaluation);
        }
    } catch (error) {
        res.status(400);
        res.json({error: error.message});
    }
});

/**
 * Route to update or insert and answer by review id.
 * The fieldnames of files should correspond to question ids.
 * @body a json object of the whole form, as specified in the doc.
 * @return JSON representation of a review.
 */
router.route("/:reviewId").put(uploadReviewFunction, index.authorization.checkReviewOwner, index.authorization.checkReviewBetweenPublishDue, async (req, res) => {
    try {
        // input
        const reviewId = req.params.reviewId;
        const inputForm = JSON.parse(req.body.form);

        // get review
        const review: any = await ReviewsPS.executeGetReview(reviewId);
        const rubricQuestions: any = await RubricPS.getAllQuestionsByRubricId(review.rubric_id);

        // remove values for all uploadquestions as these are files
        for (const formElement of inputForm) {
            const questionId = formElement.question.id;

            // Get the correct question in case of an upload question
            const currentRubricQuestion = rubricQuestions.find((x: any) => x.id === questionId);
            // in case of an uploadquestion, delete the answer
            if (currentRubricQuestion.type_question == "upload") {
                formElement.answer.answer = undefined;
            }
        }

        const uploadQuestionIds = [];

        // Upload the files of the upload questions, if present.
        // Only files with the correct file extensions are included.
        if (req.files) {
            for (const file of req.files as Express.Multer.File[]) {
                const questionId = parseInt(file.fieldname);

                // Get the correct extension of the upload question.
                const currentRubricUploadQuestion = rubricQuestions.find((x: any) => x.id === questionId);
                if (currentRubricUploadQuestion.type_question !== "upload") {
                    throw new Error("File uploaded for a non-upload question");
                }
                const correctExtension = currentRubricUploadQuestion.extension;

                // Check if the extension is correct
                if (!file.mimetype.includes(correctExtension)) {
                    res.status(400).send({error: "Invalid file extension"});
                }

                // Create and save a unique filename based on the review and question.
                const filename = `${req.params.reviewId}-${file.fieldname}.${correctExtension}`;
                const filepath = path.join(fileFolder, filename);

                // get the question in the form
                const currentFormUploadQuestion = inputForm.find((x: any) => x.question.id === questionId);
                // set the filename in the form
                currentFormUploadQuestion.answer.answer = filename;
                uploadQuestionIds.push(questionId);

                await fs.writeFile(filepath, file.buffer);
            }
        }

        // Update the review in the database.
        const result = await ReviewUpdate.updateReviewWithFileUpload(reviewId, inputForm, uploadQuestionIds);

        res.json(result);
    } catch (error) {
        res.status(400);
        res.json({error: error.message});
    }
});


/**
 * Route to get a file from an review.
 * @param id - review id.
 */
router.get("/:reviewId/questions/:question_id/file", index.authorization.checkAuthorizationForReview, async (req, res) => {
    try {
        const review: any = await ReviewsPS.executeGetUploadAnswer(req.params.reviewId, req.params.question_id);
        const fileName = path.join(fileFolder, `${review.answer}`);
        res.download(fileName);
    } catch (err) {
        res.sendStatus(400);
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