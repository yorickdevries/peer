import ReviewsPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import bodyParser from "body-parser";
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
router.get("/:reviewId", async (req, res) => {
    try {
        const jsonItems: any = [];
        const review = await ReviewsPS.executeGetReview(req.params.reviewId);
        const questions = await RubricPS.getAllQuestionsByRubricId(review.rubric_assignment_id);

        // Loop through the questions and add answers to them.
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            let answer;

            // Get the answers (from database) to the correct question type.
            switch (question.type_question) {
                case "mc": answer = await ReviewsPS.executeGetMCAnswer(+req.params.reviewId, question.id); break;
                case "open": answer = await ReviewsPS.executeGetOpenAnswer(+req.params.reviewId, question.id); break;
                case "range": answer = await ReviewsPS.executeGetRangeAnswer(+req.params.reviewId, question.id); break;
                default: answer = { error: "unrecognized question type: " + question.type_question }; break;
            }

            // Create the correct JSON format (API documentation) and push to array.
            jsonItems.push({ question: question, answer: answer });
        }

        // Assemble correct json to send in the response.
        res.json({
            review: review,
            form: jsonItems
        });
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to update or insert and answer by review id.
 * @body a json object of the whole form, as specified in the doc.
 * @return JSON representation of a review.
 */
router.put("/:reviewId", async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const jsonQuestions: any = [];

        const inputForm = req.body.form;

        // Loop through form and update the answers.
        for (let i = 0; i < inputForm.length; i++) {
            const item = inputForm[i];

            // Don't insert or update if the answer is not specified.
            if (item.answer === null) return;

            // Update or insert a specific answer and add to questions array.
            switch (item.question.type_question) {
                case "range": jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateRangeAnswer(item.answer.answer, item.question.id, reviewId)
                }); break;

                case "open": jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateOpenAnswer(item.answer.answer, item.question.id, reviewId)
                }); break;

                case "mc": jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateMpcAnswer(item.answer.answer, item.question.id, reviewId)
                }); break;
                default: jsonQuestions.push({ error: "Unrecognized type given: " + item.question.type_question }); break;
            }
        }

        // Create and respond with the resulting JSON.
        res.json({
            review: await ReviewsPS.executeGetReview(reviewId),
            form: jsonQuestions
        });
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Submit a review by id.
 * @param reviewId - an id of a review.
 * @return database return value.
 */
router.get("/:reviewId/submit", (req, res) => {
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
router.get("/:reviewId/allComments", (req, res) => {
    ReviewsPS.executeGetAllReviewComments(req.params.reviewId)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Get all review comments.
 * @param reviewId - an id of a review.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.put("/:reviewCommentId/comment", (req, res) => {
    ReviewsPS.executeUpdateReviewComment(req.params.reviewCommentId, req.body.comment)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Get all review comments.
 * @param reviewId - an id of a review.
 * @body netid - a netid.
 * @body comment - a comment of the review.
 * @return database return value.
 */
router.post("/:reviewId/comment", (req, res) => {
    ReviewsPS.executeAddReviewComment(req.params.reviewId, req.body.netid, req.body.comment)
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
router.delete("/:reviewCommentId/comment", (req, res) => {
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
router.get("/:id/file", async (req, res) => {
    try {
        const submission: any = await ReviewsPS.executeGetSubmissionByReviewId(req.params.id);
        const filePath = path.join(__dirname, "../files/submissions", submission.file_path);
        res.sendfile(filePath);
    } catch (err) {
        res.sendStatus(400);
    }
});

export default router;