import ReviewsPS from "./prepared_statements/review_ps";
import RubricPS from "./prepared_statements/rubric_ps";

/**
 * Class which takes care of updating a review in the database
 *
 * @export
 * @class ReviewUpdate
 */
export default class ReviewUpdate {
    /**
     * Get a review
     */
    public static async getReview(reviewId: number) {
        const jsonItems: any = [];
        const review = await ReviewsPS.executeGetReview(reviewId);
        const questions = await RubricPS.getAllQuestionsByRubricId(review.rubric_assignment_id);

        // Loop through the questions and add answers to them.
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            try {
                let answer: any;
                // Get the answers (from database) to the correct question type.
                switch (question.type_question) {
                    case "mc": answer = await ReviewsPS.executeGetMCAnswer(reviewId, question.id); break;
                    case "open": answer = await ReviewsPS.executeGetOpenAnswer(reviewId, question.id); break;
                    case "range": answer = await ReviewsPS.executeGetRangeAnswer(reviewId, question.id); break;
                    default: throw new Error("unrecognized question type: " + question.type_question);
                }
                // Create the correct JSON format (API documentation) and push to array.
                jsonItems.push({question: question, answer});
            } catch (error) {
                jsonItems.push({question: question, answer: {answer: ""}});
            }
        }

        // Assemble correct json to send in the response.
        return {
            review: review,
            form: jsonItems
        };
    }

    /**
     * Update a review
     */
    public static async updateReview(reviewId: number, inputForm: any[]) {
        // Create and respond with the resulting JSON.
        return {
            review: await ReviewsPS.executeGetReview(reviewId),
            form: await this.checkQuestions(reviewId, inputForm)
        };
    }

    /**
     * Check the validity of all questions
     */
    public static async checkQuestions(reviewId: number, inputForm: any[]) {
        console.log(inputForm);

        const jsonQuestions: any = [];
        // Loop through form and update the answers.
        for (let i = 0; i < inputForm.length; i++) {
            const item = inputForm[i];
            // Don't insert or update if the answer is not specified.
            if (item.answer === null) return;
            const answer = item.answer.answer;
            const questionId = item.question.id;

            // Update or insert a specific answer and add to questions array.
            switch (item.question.type_question) {
                case "range": jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateRangeAnswer(answer, questionId, reviewId)
                }); break;

                case "open": jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateOpenAnswer(answer, questionId, reviewId)
                }); break;

                case "mc": jsonQuestions.push({
                    question: item.question,
                    answer: await ReviewsPS.executeUpdateMpcAnswer(answer, questionId, reviewId)
                }); break;
                default: jsonQuestions.push({ error: "Unrecognized type given: " + item.question.type_question }); break;
            }
        }
        // Create and respond with the resulting JSON.
        return jsonQuestions;
    }
}