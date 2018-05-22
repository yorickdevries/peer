import ReviewsPS from "../prepared_statements/review_ps";

// Router
import { Router } from "express";
const router = Router();

/**
 * Route to get a review by review id.
 * @param review_id - a review id.
 * @return a database query result, all columns of review + file_path of the submission.
 */
router.get("/:review_id", async (req, res) => {
    res.json(await ReviewsPS.executeGetReview(req.params.review_id));
});

/*
JSON (example):
{
    updateValues: [
        {
            reviewId: 1,
            questionId: 1,
            type: "range",
            answer: 3
        },
        {
            reviewId: 1,
            questionId: 2,
            type: "open",
            answer: "very gud answer"
        },
        {
            reviewId: 1,
            questionId: 3,
            type: "mc",
            answer: "B"
        }
    ]
}
*/
router.post("/", async (req, res) => {
    req.body.updateValues.foreach(async (question: any) => {
        switch (question.type) {
            case "range": {
                res.json(await ReviewsPS.executeUpdateRangeAnswer(question.answer, question.questionId, question.reviewId));
                break;
            }
            case "open": {
                res.json(await ReviewsPS.executeUpdateOpenAnswer(question.answer, question.questionId, question.reviewId));
                break;
            }
            case "mc": {
                res.json(await ReviewsPS.executeUpdateMpcAnswer(question.answer, question.questionId, question.reviewId));
                break;
            }
            default: {
                res.json({ error: "Unrecognized type given: " + question.type })
                break;
            }
        }
    });
});

/**
 * Submit a review by id.
 * @param review_id - an id of a review.
 * @return database return value.
 */
router.get("/:id/submit", async (req, res) => {
    res.json(await ReviewsPS.executeSubmitReview(req.params.review_id));
});

export default router;