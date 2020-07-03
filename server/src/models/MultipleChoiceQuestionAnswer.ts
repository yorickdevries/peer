import { ChildEntity, ManyToOne } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import Review from "./Review";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

@ChildEntity(QuestionAnswerType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  @ManyToOne((_type) => MultipleChoiceQuestionOption, {
    eager: true,
  })
  multipleChoiceAnswer: MultipleChoiceQuestionOption;

  constructor(
    question: MultipleChoiceQuestion,
    review: Review,
    answer: MultipleChoiceQuestionOption
  ) {
    super(question, review);
    this.multipleChoiceAnswer = answer;
  }
  // validation: options should be oart of question
}
