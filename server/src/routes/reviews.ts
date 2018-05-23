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


let mock = {
    id: 1,
    rubric_assignment_id: 1,
    file_path: 'www.example.path',
    comment: "",
    done: false,

    form: [
        {
            question: {
                id: 32131,
                question_number: 1,
                type: "range",
                range: 7,
                question: "How good is the project?"
            },
            answer: {
                answer: null
            }
        },
        {
            question: {
                id: 213,
                question_number: 2,
                type: "open",
                question: "Give your thoughts!"
            },
            answer: {
                answer: null
            }
        },
        {
            question: {
                id: 312,
                question_number: 3,
                type: "mpc",
                question: "Choose one",
                options: [
                    {
                        id: 23,
                        option: "Option A"
                    },
                    {
                        id: 55,
                        option: "Option B"
                    }
                ]
            },
            answer: {
                answer: 23
            }
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
                res.json({ error: "Unrecognized type given: " + question.type });
                break;
            }
        }
    });
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