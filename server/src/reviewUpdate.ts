import ReviewsPS from "./prepared_statements/review_ps";

/**
 * Class which takes care of updating a review in the database
 *
 * @export
 * @class ReviewUpdate
 */
export default class ReviewUpdate {
    /**
     * Update a review
     */
    public static async updateReview(reviewId: number, inputForm: any[]) {
        const jsonQuestions: any = [];
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
        return {
            review: await ReviewsPS.executeGetReview(reviewId),
            form: jsonQuestions
        };
    }
}