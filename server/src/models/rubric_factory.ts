import RubricPS from "../prepared_statements/rubric_ps";

interface OpenQuestion {
    question: string;
}

interface MultipleChoiceQuestion {
    question: string;
    options: string[];
}

interface RangeQuestion {
    question: string;
    range: number;
}

export interface RubricConfiguration {
    rubric_type: "submission" | "review";
    questions: (OpenQuestion | MultipleChoiceQuestion | RangeQuestion)[];
}

/**
 * Function to determine the type of the question.
 * There is a more convenient way to do this with newer TypeScript versions (.kind on types).
 * @param {OpenQuestion | MultipleChoiceQuestion | RangeQuestion} question
 * @return {"open" | "mc" | "range"}
 */
function getQuestionType(question: OpenQuestion | MultipleChoiceQuestion | RangeQuestion): "open" | "mc" | "range" {
    if ((<MultipleChoiceQuestion>question).options !== undefined) {
        return "mc";
    }

    if ((<RangeQuestion>question).range !== undefined) {
        return "range";
    }

    // Open questions only have a "question", which all other questions also have.
    return "open";
}

/**
 * Generate a rubric based on a rubric configuration.
 * @param {RubricConfiguration} config
 * @param {number} assignmentId
 * @return {Promise<void>}
 */
export async function generateRubric(config: RubricConfiguration, assignmentId: number) {
    const rubric: any = await RubricPS.executeCreateRubric(assignmentId, config.rubric_type);

    // Add the questions to the rubric
    for (let index = 0; index < config.questions.length; index++) {
        const rubricQuestion = config.questions[index];

        const questionNumber = index + 1;

        switch (getQuestionType(rubricQuestion)) {
            // After this point, we know for sure which QuestionType 'rubricQuestion' is, so it will be type casted appropriately.
            case "open":
                await RubricPS.executeCreateOpenQuestion(rubricQuestion.question, rubric.id, questionNumber);
                break;
            case "range":
                await RubricPS.executeCreateRangeQuestion(rubricQuestion.question, (<RangeQuestion> rubricQuestion).range, rubric.id, questionNumber);
                break;
            case "mc":
                const mcQuestion = <MultipleChoiceQuestion> rubricQuestion;
                const mcQuestionDb: any = await RubricPS.executeCreateMCQuestion(mcQuestion.question, rubric.id, questionNumber);

                // Add the options to the multiple choice question.
                for (const option of mcQuestion.options) {
                    await RubricPS.executeCreateMCOption(option, mcQuestionDb.id);
                }
                break;
        }
    }

    return rubric;
}