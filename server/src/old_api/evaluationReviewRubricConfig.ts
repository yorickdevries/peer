import { RubricConfiguration } from "./models/rubric_factory";

// configuration file
const evaluationReviewRubricConfig: RubricConfiguration = {
    rubric_type: "review",
    questions: [
        {
            question: "Was the review comprehensive and complete, covering all relevant aspects of the work?",
            options: [
                "A: Yes",
                "B: No"
            ],
            optional: false
        },
        {
            question: "Was the input factually correct?",
            options: [
                "A: Yes, fully",
                "B: Yes, mostly",
                "C: No, mostly not",
                "D: No, not at all"
            ],
            optional: false
        },
        {
            question: "Did you, during later revision of the original submission, spot any mistakes that the reviewer overlooked?",
            options: [
                "A: Yes, major mistakes",
                "B: Yes, minor mistakes",
                "C: No"
            ],
            optional: false
        },
        {
            question: "Did the reviewer submit any open feedback (text or pdf)?",
            options: [
                "A: Yes",
                "B: No"
            ],
            optional: false
        },
        {
            question: "If there was any open feedback, how much?",
            options: [
                "A: Too little",
                "B: An acceptable amount",
                "C: Much",
                "D: Not applicable"
            ],
            optional: false
        },
        {
            question: "If there was any open feedback, did you find it formulated in a clear and understandable way?",
            options: [
                "A: Yes",
                "B: No",
                "C: Not applicable"
            ],
            optional: false
        },
        {
            question: "If there was any open feedback, did you find it formulated in a constructive way, so giving an idea how to improve the work?",
            options: [
                "A: Yes",
                "B: No",
                "C: Not applicable"
            ],
            optional: false
        },
        {
            question: "Overall, do you agree with the reviewer's assessment of the work?",
            options: [
                "A: Yes, fully",
                "B: Yes, mostly",
                "C: No, mostly not",
                "D: No, not at all"
            ],
            optional: false
        },
        {
            question: "What overall grade would you give the review?",
            range: 10,
            optional: false
        },
        {
            question: "What do you think about the review overall? If you did not choose \"Yes, fully\" in question 2, then please list the factual mistakes of the review here, in a way that can be read without referring to the original submission or the review.",
            optional: false
        }
    ]
};


export default evaluationReviewRubricConfig;