import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import CheckboxQuestion from "./CheckboxQuestion";
import ResponseMessage from "../enum/ResponseMessage";

@ChildEntity(QuestionOptionType.CHECKBOX)
export default class CheckboxQuestionOption extends QuestionOption {
  @RelationId(
    (checkboxQuestionOption: CheckboxQuestionOption) =>
      checkboxQuestionOption.question
  )
  questionId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => CheckboxQuestion, (question) => question.options, {
    nullable: false,
  })
  question?: CheckboxQuestion;

  constructor(text: string, question: CheckboxQuestion, points: number | null) {
    super(text, points);
    this.question = question;
  }

  // custom validation which is run before saving
  validateOrReject(): Promise<void> {
    if (this.question) {
      if (this.question.graded && this.points == null) {
        throw new Error(ResponseMessage.NON_GRADED_OPTION_FOR_QUESTION_GRADED);
      } else if (!this.question.graded && this.points != null) {
        throw new Error(ResponseMessage.GRADED_OPTION_FOR_NON_QUESTION_GRADED);
      }
    }
    return super.validateOrReject();
  }

  async getQuestion(): Promise<CheckboxQuestion> {
    return CheckboxQuestion.findOneOrFail(this.questionId);
  }
}
