import QuestionType from "../enum/QuestionType";
import Extensions from "../enum/Extensions";

interface Option {
  text: string;
  points?: number;
}

interface QuestionTemplate {
  text: string;
  number: number;
  optional: boolean;
  type: QuestionType;
  range?: number;
  extensions?: Extensions;
  options?: Option[];
  graded: boolean;
}

const templateQuestionsUngraded: QuestionTemplate[] = [
  {
    text:
      "Was the review comprehensive and complete, covering all relevant aspects of the work?",
    number: 1,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ text: "A: Yes" }, { text: "B: No" }],
    graded: false,
  },
  {
    text: "Was the input factually correct?",
    number: 2,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, fully" },
      { text: "B: Yes, mostly" },
      { text: "C: No, mostly not" },
      { text: "D: No, not at all" },
    ],
    graded: false,
  },
  {
    text:
      "Did you, during later revision of the original submission, spot any mistakes that the reviewer overlooked?",
    number: 3,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, major mistakes" },
      { text: "B: Yes, minor mistakes" },
      { text: "C: No" },
    ],
    graded: false,
  },
  {
    text: "Did the reviewer submit any open feedback (text or pdf)?",
    number: 4,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [{ text: "A: Yes" }, { text: "B: No" }],
    graded: false,
  },
  {
    text: "If there was any open feedback, how much?",
    number: 5,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Too little" },
      { text: "B: An acceptable amount" },
      { text: "C: Much" },
      { text: "D: Not applicable" },
    ],
    graded: false,
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a clear and understandable way?",
    number: 6,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes" },
      { text: "B: No" },
      { text: "C: Not applicable" },
    ],
    graded: false,
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a constructive way, so giving an idea how to improve the work?",
    number: 7,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes" },
      { text: "B: No" },
      { text: "C: Not applicable" },
    ],
    graded: false,
  },
  {
    text: "Overall, do you agree with the reviewer's assessment of the work?",
    number: 8,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, fully" },
      { text: "B: Yes, mostly" },
      { text: "C: No, mostly not" },
      { text: "D: No, not at all" },
    ],
    graded: false,
  },
  {
    text: "What overall grade would you give the review?",
    number: 9,
    optional: false,
    type: QuestionType.RANGE,
    range: 10,
    graded: false,
  },
  {
    text:
      'What do you think about the review overall? If you did not choose "Yes, fully" in question 2, then please list the factual mistakes of the review here, in a way that can be read without referring to the original submission or the review.',
    number: 10,
    optional: false,
    type: QuestionType.OPEN,
    graded: false,
  },
];

const templateQuestionsGraded: QuestionTemplate[] = [
  {
    text:
      "Was the review comprehensive and complete, covering all relevant aspects of the work?",
    number: 1,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes", points: 100 },
      { text: "B: No", points: 0 },
    ],
    graded: true,
  },
  {
    text: "Was the input factually correct?",
    number: 2,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, fully", points: 100 },
      { text: "B: Yes, mostly", points: 70 },
      { text: "C: No, mostly not", points: 30 },
      { text: "D: No, not at all", points: 0 },
    ],
    graded: true,
  },
  {
    text:
      "Did you, during later revision of the original submission, spot any mistakes that the reviewer overlooked?",
    number: 3,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, major mistakes", points: 0 },
      { text: "B: Yes, minor mistakes", points: 50 },
      { text: "C: No", points: 100 },
    ],
    graded: true,
  },
  {
    text: "Did the reviewer submit any open feedback (text or pdf)?",
    number: 4,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes", points: 100 },
      { text: "B: No", points: 0 },
    ],
    graded: true,
  },
  {
    text: "If there was any open feedback, how much?",
    number: 5,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Too little", points: 30 },
      { text: "B: An acceptable amount", points: 70 },
      { text: "C: Much", points: 100 },
      { text: "D: Not applicable", points: 0 },
    ],
    graded: true,
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a clear and understandable way?",
    number: 6,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes", points: 100 },
      { text: "B: No", points: 0 },
      { text: "C: Not applicable", points: 0 },
    ],
    graded: true,
  },
  {
    text:
      "If there was any open feedback, did you find it formulated in a constructive way, so giving an idea how to improve the work?",
    number: 7,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes", points: 100 },
      { text: "B: No", points: 0 },
      { text: "C: Not applicable", points: 0 },
    ],
    graded: true,
  },
  {
    text: "Overall, do you agree with the reviewer's assessment of the work?",
    number: 8,
    optional: false,
    type: QuestionType.MULTIPLE_CHOICE,
    options: [
      { text: "A: Yes, fully", points: 100 },
      { text: "B: Yes, mostly", points: 70 },
      { text: "C: No, mostly not", points: 30 },
      { text: "D: No, not at all", points: 0 },
    ],
    graded: true,
  },
  {
    text: "What overall grade would you give the review?",
    number: 9,
    optional: false,
    type: QuestionType.RANGE,
    range: 10,
    graded: false,
  },
  {
    text:
      'What do you think about the review overall? If you did not choose "Yes, fully" in question 2, then please list the factual mistakes of the review here, in a way that can be read without referring to the original submission or the review.',
    number: 10,
    optional: false,
    type: QuestionType.OPEN,
    graded: false,
  },
];

export { templateQuestionsUngraded, templateQuestionsGraded };
