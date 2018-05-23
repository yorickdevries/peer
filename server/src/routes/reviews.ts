import ReviewsPS from "../prepared_statements/review_ps";

// Router
import { Router } from "express";
const router = Router();

/**
 * Route to get a review by review id.
 * @param reviewId - a review id.
 * @return a database query result, all columns of review + file_path of the submission.
 */
router.get("/:reviewId", async (req, res) => {
    res.json(await ReviewsPS.executeGetReview(req.params.reviewId));
});


/**
 * Route to update or insert and answer by review id.
 * @body a json object of the whole form, as specified in the doc.
 * @return
 */
router.put("/:reviewId", async (req, res) => {
    const reviewId = req.params.reviewId;
    let jsonQuestions: any = [];

    req.body.form.foreach(async (item: any) => {
        // Don't insert or update if the answer is not specified.
        if (item.answer == null) return;

        // Update or insert a specific answer.
        switch (item.question.type_question) {
            case "range": {
                jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateRangeAnswer(
                        item.answer,
                        item.question.id,
                        reviewId)
                });
                break;
            }
            case "open": {
                jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateOpenAnswer(
                        item.answer,
                        item.question.id,
                        reviewId)
                });
                break;
            }
            case "mpc": {
                jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateMpcAnswer(
                        item.answer,
                        item.question.id,
                        reviewId)
                });
                break;
            }
            default: {
                jsonQuestions.push({ error: "Unrecognized type given: " + item.question.type_question });
                break;
            }
        }
    });

    return {
        review: await ReviewsPS.executeGetReview(reviewId),
        form: jsonQuestions
    }
});

/**
 * Submit a review by id.
 * @param reviewId - an id of a review.
 * @return database return value.
 */
router.get("/:reviewId/submit", async (req, res) => {
    res.json(await ReviewsPS.executeSubmitReview(req.params.reviewId));
});

export default router;