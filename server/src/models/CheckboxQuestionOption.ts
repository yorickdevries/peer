import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import CheckboxQuestion from "./CheckboxQuestion";

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

  constructor(text: string, question: CheckboxQuestion) {
    super(text);
    this.question = question;
  }

  async getQuestion(): Promise<CheckboxQuestion> {
    return CheckboxQuestion.findOneOrFail(this.questionId);
  }
}
