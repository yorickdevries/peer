import ReviewsPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";

// Router
import { Router } from "express";
const router = Router();

/**
 * Route to get a review by review id.
 * @param reviewId - a review id.
 * @return a database query result, all columns of review + file_path of the submission.
 */
router.get("/:reviewId", async (req, res) => {
    let jsonItems: any = [];
    const review = await ReviewsPS.executeGetReview(req.params.reviewId);
    const questions = await RubricPS.getAllQuestionsByRubricId(review.rubric_assignment_id);

    // Loop through the questions and add answers to them.
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        let answer;

        // Get the answers (from database) to the correct question type.
        switch (question.type_question) {
            case "mc": answer = await ReviewsPS.executeGetMCAnswer(req.params.reviewId, question.id); break;
            case "open": answer = await ReviewsPS.executeGetOpenAnswer(req.params.reviewId, question.id); break;
            case "range": answer = await ReviewsPS.executeGetRangeAnswer(req.params.reviewId, question.id); break;
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
});

/**
 * Route to update or insert and answer by review id.
 * @body a json object of the whole form, as specified in the doc.
 * @return JSON representation of a review.
 */
router.put("/:reviewId", async (req, res) => {
    const reviewId = req.params.reviewId;
    let jsonQuestions: any = [];

    let inputForm = req.body.form;

    // Loop through form and update the answers.
    for (let i = 0; i < inputForm.length; i++) {
        const item = inputForm[i];

        // Don't insert or update if the answer is not specified.
        if (item.answer == null) return;

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
                answer: await ReviewsPS.executeUpdateMpcAnswer(item.answer.answer_option, item.question.id, reviewId)
            }); break;
            default: jsonQuestions.push({ error: "Unrecognized type given: " + item.question.type_question }); break;
        }
    }

    // Create and respond with the resulting JSON.
    res.json({
        review: await ReviewsPS.executeGetReview(reviewId),
        form: jsonQuestions
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