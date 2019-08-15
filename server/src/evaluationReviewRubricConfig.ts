import { RubricConfiguration } from "./models/rubric_factory";

// configuration file
const evaluationReviewRubricConfig: RubricConfiguration = {
    rubric_type: "review",
    questions: [
        {
            question: "Was the review comprehensive and complete, covering all relevant aspects of the work?",
            options: [
                "Yes",
                "No"
            ]
        },
        {
            question: "Was the input factually correct?",
            options: [
                "Yes, fully",
                "Yes, mostly",
                "No, mostly not",
                "No, not at all"
            ]
        },
        {
            question: "Did you, during later revision of the original submission, spot any mistakes that the reviewer overlooked?",
            options: [
                "Yes, major mistakes",
                "Yes, minor mistakes",
                "No"
            ]
        },
        {
            question: "Did the reviewer submit any open feedback (text or pdf)?",
            options: [
                "Yes",
                "No"
            ]
        },
        {
            question: "If there was any open feedback, how much?",
            options: [
                "Too little",
                "An acceptable amount",
                "Much",
                "Not applicable"
            ]
        },
        {
            question: "If there was any open feedback, did you find it formulated in a clear and understandable way?",
            options: [
                "Yes",
                "No",
                "Not applicable"
            ]
        },
        {
            question: "If there was any open feedback, did you find it formulated in a constructive way, so giving an idea how to improve the work?",
            options: [
                "Yes",
                "No",
                "Not applicable"
            ]
        },
        {
            question: "Overall, do you agree with the reviewer’s assessment of the work?",
            options: [
                "Yes, fully",
                "Yes, mostly",
                "No, mostly not",
                "No, not at all"
            ]
        },
        {
            question: "What overall grade would you give the review?",
            range: 10
        },
        {
            question: "What do you think about the review overall? If you did not choose “Yes, fully” in question 2, then please list the factual mistakes of the review here, in a way that can be read without referring to the original submission or the review.",
        }
    ]
};


export default evaluationReviewRubricConfig;