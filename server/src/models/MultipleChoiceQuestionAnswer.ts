import { ChildEntity, ManyToOne } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import Review from "./Review";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

@ChildEntity(QuestionAnswerType.MULTIPLECHOICE)
export default class MultipleChoiceQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  @ManyToOne((_type) => MultipleChoiceQuestionOption, {
    nullable: false,
  })
  answer: MultipleChoiceQuestionOption;

  constructor(
    question: MultipleChoiceQuestion,
    review: Review,
    answer: MultipleChoiceQuestionOption
  ) {
    super(question, review);
    this.answer = answer;
  }
}
