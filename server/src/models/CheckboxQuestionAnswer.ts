import { ChildEntity, ManyToMany, JoinTable } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import CheckboxQuestionOption from "./CheckboxQuestionOption";
import CheckboxQuestion from "./CheckboxQuestion";

@ChildEntity(QuestionAnswerType.CHECKBOX)
export default class CheckboxQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  @ManyToMany((_type) => CheckboxQuestionOption, { eager: true })
  @JoinTable()
  checkboxAnswer: CheckboxQuestionOption[];

  constructor(
    question: CheckboxQuestion,
    review: Review,
    answer: CheckboxQuestionOption[]
  ) {
    super(question, review);
    this.checkboxAnswer = answer;
  }

  // validation: options should be oart of question
}
