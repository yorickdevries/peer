import ReviewsPS from "./prepared_statements/review_ps";
import RubricPS from "./prepared_statements/rubric_ps";

/**
 * Class which takes care of getting and updating a review in the database
 */
export default class ReviewUpdate {
    /**
     * Get a review
     * @param {number} reviewId
     * @returns json response with the review and answers.
     */
    public static async getReview(reviewId: number) {
        const jsonItems: any = [];
        const review = await ReviewsPS.executeGetReview(reviewId);
        const questions = await RubricPS.getAllQuestionsByRubricId(review.rubric_id);
        questions.sort(function(a, b) {return a.question_number - b.question_number; });

        // Loop through the questions and add answers to them.
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            try {
                let answer: any;
                // Get the answers (from database) to the correct question type.
                switch (question.type_question) {
                    case "mc": answer = await ReviewsPS.executeGetMCAnswer(review.id, question.id); break;
                    case "checkbox": {
                        // create answer object
                        answer = {
                            answer: [],
                            checkboxquestion_id: question.id,
                            review_id: review.id
                        };
                        // fill the answer field
                        const options = await RubricPS.executeGetAllCheckboxOptionsByQuestionId(question.id);
                        for (const option of options) {
                            const optionAnswer: any = await ReviewsPS.executeGetCheckboxAnswer(review.id, option.id);
                            const chosen = optionAnswer.answer;
                            if (chosen) {
                                answer.answer.push(option.id);
                            }
                        }
                        break;
                    }
                    case "open": answer = await ReviewsPS.executeGetOpenAnswer(reviewId, question.id); break;
                    case "range": answer = await ReviewsPS.executeGetRangeAnswer(reviewId, question.id); break;
                    case "upload": answer = await ReviewsPS.executeGetUploadAnswer(reviewId, question.id); break;
                    default: throw new Error("unrecognized question type: " + question.type_question);
                }
                // Create the correct JSON format (API documentation) and push to array.
                jsonItems.push({question: question, answer: answer});
            // in case no answer exists yet, return an empty answer
            } catch (error) {
                jsonItems.push({question: question, answer: {answer: undefined}});
            }
        }
        // Assemble correct json to send in the response.
        return {review: review, form: jsonItems};
    }

    /**
     * Get a boolean whether the review is completely filled in.
     * @param {number} reviewId
     * @returns boolean whether the review is completely filled in.
     */
    public static async isCompletelyFilledIn(reviewId: number) {
        const review: any = await this.getReview(reviewId);
        const reviewForm = review.form;
        for (let j = 0; j < reviewForm.length; j++) {
            const answer = reviewForm[j].answer.answer;
            const optional = reviewForm[j].question.optional;
            if (!optional && answer == undefined) {
                return false;
            }
        }
        return true;
    }

    /**
     * Update a review
     * @param {number} reviewId
     * @param {any[]} inputForm
     * @returns the review as json.
     */
    public static async updateReview(reviewId: number, inputForm: any[]) {
        return this.updateReviewWithFileUpload(reviewId, inputForm, []);
    }

    /**
     * Update a review with file upload questions.
     * @param {number} reviewId - the review id.
     * @param {any[]} inputForm - the input form.
     * @param {number[]} fileUploadQuestionIds - the question ids of each file upload question.
     * @param flagged - whether the review is flagged or not
     * @return {Promise<{review: any; form: any}>}
     */
    public static async updateReviewWithFileUpload(reviewId: number, inputForm: any[], fileUploadQuestionIds: number[], flagged: boolean = false) {
        // check all questions
        const checkedQuestions = await this.checkQuestions(reviewId, inputForm, fileUploadQuestionIds);
        // If no error, apply all questions to the database
        await this.applyQuestions(reviewId, checkedQuestions);
        // Update the flag state of the review
        await ReviewsPS.executeFlagReview(reviewId, flagged);
        // Get and return the new review
        return this.getReview(reviewId);
    }

    /**
     * Check the validity of all questions
     * @param {number} reviewId
     * @param {any[]} inputForm
     * @param fileUploadQuestionIds
     * @returns list of the questions or an error.
     */
    public static async checkQuestions(reviewId: number, inputForm: any[], fileUploadQuestionIds: number[]) {
        const review = await ReviewsPS.executeGetReview(reviewId);
        const rubric: any = await RubricPS.executeGetRubricById(review.rubric_id);
        const rubricId = rubric.id;

        // build up the questionlist
        const questionList: any = [];
        // Loop through form and update the answers.
        for (let i = 0; i < inputForm.length; i++) {
            const item = inputForm[i];

            // Get important parameters
            const questionObject = item.question;
            const answerObject = item.answer;
            if (questionObject == undefined || questionObject.id == undefined || answerObject == undefined) {
                throw new Error("Question isn't formatted properly at index: " + i);
            }
            const questionId = questionObject.id;
            const answerText = answerObject.answer;

            // If the answer is undefined, skip
            if (answerText == undefined) {
                continue;
            }
            const questionType = questionObject.type_question;

            // Check the answer based on the questiontype
            switch (questionType) {
                case "range":
                    questionList.push(await this.checkRangeQuestion(questionId, rubricId, answerText));
                break;
                case "open":
                    questionList.push(await this.checkOpenQuestion(questionId, rubricId, answerText));
                break;
                case "mc":
                    questionList.push(await this.checkMCQuestion(questionId, rubricId, answerText));
                break;
                case "checkbox":
                    questionList.push(await this.checkCheckboxQuestion(questionId, rubricId, answerText));
                break;
                case "upload":
                    // If the question id is not contained, the user did not upload a file. Skip this one.
                    // Usually, this is handled by the front-end. However, this was hard to do (easier here)
                    // due to the file-upload functionality of Vue, which would add a lot of logic in the front-end.
                    if (fileUploadQuestionIds.some(x => x === questionId)) {
                        questionList.push(await this.checkUploadQuestion(questionId, answerText));
                    }
                break;
                default: throw new Error("Unrecognized question type: " + questionType);
            }
        }
        return questionList;
    }

    /**
     * Checks whether an answer for an range question is valid to add to the database
     * @param {number} questionId
     * @param {number} rubricId
     * @param {*} answerText
     * @returns range question json.
     */
    public static async checkRangeQuestion(questionId: number, rubricId: number, answerText: any) {
        // Initialize the question variable
        let question;
        try {
            question = await RubricPS.executeGetRangeQuestionByIdAndRubricId(questionId, rubricId);
        } catch (error) {
            throw new Error("Wrong Range Question: " + questionId);
        }
        // answer validation
        if (!Number.isInteger(answerText) || answerText > question.range || answerText < 0) {
            throw new Error("The following Range Question has an answer out of range: " + questionId);
        } else {
            return {
                questionType: "range",
                questionId: questionId,
                answer: answerText
            };
        }
    }

    /**
     * Checks whether an answer for an open question is valid to add to the database
     * @param {number} questionId
     * @param {number} rubricId
     * @param {*} answerText
     * @returns open question json.
     */
    public static async checkOpenQuestion(questionId: number, rubricId: number, answerText: any) {
        // Initialize the question variable
        let question;
        try {
            question = await RubricPS.executeGetOpenQuestionByIdAndRubricId(questionId, rubricId);
        } catch (error) {
            throw new Error("Wrong Open Question: " + questionId);
        }
        // answer validation
        // !question.optional is a temporary fix, we would want to delete the entry
        if (!(typeof answerText === "string") || (answerText == "" && !question.optional)) {
            throw new Error("The following Open Question has an invalid answer: " + questionId);
        } else {
            return {
                questionType: "open",
                questionId: questionId,
                answer: answerText
            };
        }
    }

    /**
     * Checks whether an answer for an upload question is valid to add to the database
     * @param {number} questionId
     * @param {number} rubricId
     * @param {*} answerText
     * @returns open question json.
     */
    public static async checkUploadQuestion(questionId: number, answerText: any) {
        // The upload check is done before the reviewUpdate step, to filter out false extension types.
        // The answer corresponds to the filename, which is automatically set and is therefore always correct.
        return {
            questionType: "upload",
            questionId: questionId,
            answer: answerText
        };
    }

    /**
     * Checks whether an answer for an MC question is valid to add to the database
     * @param {number} questionId
     * @param {number} rubricId
     * @param {*} answerText
     * @returns mc question json.
     */
    public static async checkMCQuestion(questionId: number, rubricId: number, answerText: any) {
        // Initialize the question variable
        let question;
        try {
            question = await RubricPS.executeGetMCQuestionByIdAndRubricId(questionId, rubricId);
        } catch (error) {
            throw new Error("Wrong MC Question: " + questionId);
        }
        const options = await RubricPS.executeGetAllMCOptionById(question.id);
        const chosenoption = options.find((option: any) => option.id == answerText);
        // answer validation
        if (chosenoption == undefined) {
            throw new Error("The following MC Question has an invalid answer: " + questionId);
        } else {
            return {
                questionType: "mc",
                questionId: questionId,
                answer: answerText
            };
        }
    }

    /**
     * Checks whether an answer for a Checkbox question is valid to add to the database
     * @param {number} questionId
     * @param {number} rubricId
     * @param {*} answerText
     * @returns checkbox question json.
     */
    public static async checkCheckboxQuestion(questionId: number, rubricId: number, answerText: number[]) {
        // Initialize the question variable
        let question;
        try {
            question = await RubricPS.executeGetCheckboxQuestionByIdAndRubricId(questionId, rubricId);
        } catch (error) {
            throw new Error("Wrong Checkbox Question: " + questionId);
        }
        const options = await RubricPS.executeGetAllCheckboxOptionsByQuestionId(question.id);

        for (const chosenOption of answerText) {
            const option = options.find((option: any) => option.id == chosenOption);
            if (option == undefined) {
                throw new Error("The following Checkbox Question has an invalid answer: " + questionId);
            }
        }
        return {
            questionType: "checkbox",
            questionId: questionId,
            answer: answerText
        };
    }

    /**
     * Apply all questions to the database
     * @param {number} reviewId
     * @param {any[]} checkedQuestions
     */
    public static async applyQuestions(reviewId: number, checkedQuestions: any[]) {
        // Loop through checkedQuestions and update the answers.
        try {
            for (let i = 0; i < checkedQuestions.length; i++) {
                const item = checkedQuestions[i];
                // get variables
                const questionType = item.questionType;
                const questionId = item.questionId;
                const answer = item.answer;
                // Update or insert a specific answer and add to questions array.
                switch (questionType) {
                    case "range":
                        await ReviewsPS.executeUpdateRangeAnswer(answer, questionId, reviewId);
                    break;
                    case "open":
                        await ReviewsPS.executeUpdateOpenAnswer(answer, questionId, reviewId);
                    break;
                    case "mc":
                        await ReviewsPS.executeUpdateMpcAnswer(answer, questionId, reviewId);
                    break;
                    case "checkbox":
                        const options = await RubricPS.executeGetAllCheckboxOptionsByQuestionId(questionId);
                        for (const option of options) {
                            const chosen: boolean = answer.includes(option.id);
                            await ReviewsPS.executeUpdateCheckboxAnswer(chosen, option.id, reviewId);
                        }
                    break;
                    case "upload":
                        await ReviewsPS.executeUpdateUploadAnswer(answer, questionId, reviewId);
                    break;
                    default: throw new Error("Unrecognized question type: " + questionType);
                }
            }
            return;
        } catch {
            throw new Error("An error occured while inserting the review to the database");
        }
    }
}