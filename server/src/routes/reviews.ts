import ReviewsPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import ReviewUpdate from "../reviewUpdate";
import index from "../security/index";
import path from "path";
import upload from "../middleware/upload";
import fs from "fs-extra";
import config from "../config";

// Router
import express from "express";
const router = express();
// Needed for the tests (tests need to change)
router.use(express.json());

const fileFolder = config.reviews.fileFolder;

/**
 * Route to get a review by review id.
 * @param reviewId - a review id.
 * @return a database query result, all columns of review + file_path of the submission.
 */
router.route("/:reviewId").get(index.authorization.checkAuthorizationForReview, async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const result = await ReviewUpdate.getReview(reviewId);

        // Update the started_at date of the review
        const fullReview: any = await ReviewsPS.executeGetFullReview(reviewId);
        if (req.user.netid == fullReview.user_netid) {
            await ReviewsPS.executeUpdateStartedAtIfNull(reviewId);
        }

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
        const reviewEvaluation: any = await ReviewsPS.executeGetFullReviewEvaluation(reviewId);
        res.json({
            id: reviewEvaluation.id,
            user_netid: reviewEvaluation.user_netid
            });
    } catch (error) {
        res.status(400);
        res.json({error: "Does not exists"});
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
            res.json({
                id: reviewEvaluation.id,
                user_netid: reviewEvaluation.net_id
                });
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
router.route("/:reviewId").put(upload(undefined, config.allowed_extensions, config.reviews.maxSizeReviewFile), index.authorization.checkReviewOwner, index.authorization.checkReviewEditAllowed, async (req, res) => {
    try {
        // input
        const reviewId = req.params.reviewId;
        const inputForm = JSON.parse(req.body.form);
        const flagged = JSON.parse(req.body.review).flagged;
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
                const currentRubricUploadQuestion = rubricQuestions.find((x: any) => x.id === questionId && x.type_question === 'upload');

                // Find the corresponding question
                let previousFile: string | undefined = undefined;
                const review: any = await ReviewUpdate.getReview(reviewId);
                const reviewForm = review.form;
                for (let j = 0; j < reviewForm.length; j++) {
                    if (currentRubricUploadQuestion.id == reviewForm[j].question.id && reviewForm[j].question.type_question === 'upload') {
                        previousFile = reviewForm[j].answer.answer;
                    }
                }

                if (currentRubricUploadQuestion.type_question !== "upload") {
                    throw new Error("File uploaded for a non-upload question");
                }
                const correctExtensions: string[] = currentRubricUploadQuestion.extension.split(",");

                // Check if the extension is correct
                const extension = path.extname(file.originalname);
                if (!correctExtensions.includes(extension)) {
                    throw new Error("Invalid file extension");
                }
                // Create and save a unique filename based on the review and question.
                const filename = `${req.params.reviewId}-${file.fieldname}${extension}`;
                const filepath = path.join(fileFolder, filename);

                // get the question in the form
                const currentFormUploadQuestion = inputForm.find((x: any) => x.question.id === questionId &&  x.question.type_question === 'upload');
                // set the filename in the form
                currentFormUploadQuestion.answer.answer = filename;
                uploadQuestionIds.push(questionId);

                if (previousFile) {
                    const previousFilePath = path.join(fileFolder, previousFile);
                    await fs.unlink(previousFilePath);
                }
                await fs.writeFile(filepath, file.buffer);
            }
        }

        // Update the review in the database.
        const result = await ReviewUpdate.updateReviewWithFileUpload(reviewId, inputForm, uploadQuestionIds, flagged);

        // Update the saved_at date of the review.
        const fullReview: any = await ReviewsPS.executeGetFullReview(reviewId);
        if (req.user.netid == fullReview.user_netid) {
            await ReviewsPS.executeUpdateSavedAt(reviewId);
        }

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
router.route("/:reviewId/submit").get(index.authorization.checkReviewOwnerDone, index.authorization.checkReviewEditAllowed, async (req, res) => {
    const reviewId = req.params.reviewId;
    const flagged = (await ReviewsPS.executeGetReview(reviewId)).flagged;
    const reviewFilled = await ReviewUpdate.isCompletelyFilledIn(reviewId);
    if (reviewFilled || flagged === true) {
        const result = await ReviewsPS.executeSubmitReview(reviewId);

        // Update the submitted_at date of the review
        const fullReview: any = await ReviewsPS.executeGetFullReview(reviewId);
        if (req.user.netid == fullReview.user_netid) {
            await ReviewsPS.executeUpdateSubmittedAt(reviewId);
        }

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
router.route("/:reviewId/unsubmit").get(index.authorization.checkReviewOwnerDone, index.authorization.checkReviewEditAllowed, async (req, res) => {
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
        const reviewId = req.params.reviewId;

        // errors in case of submission is null
        const submission: any = await ReviewsPS.executeGetSubmissionByReviewId(reviewId);
        const filePath = path.join(config.submissions.fileFolder, submission.file_path);

        // Update the downloaded_at date of the review
        const fullReview: any = await ReviewsPS.executeGetFullReview(reviewId);
        if (req.user.netid == fullReview.user_netid) {
            await ReviewsPS.executeUpdateDownloadedAtIfNull(reviewId);
        }

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