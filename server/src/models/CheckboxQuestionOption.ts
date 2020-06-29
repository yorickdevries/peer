import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import CheckboxQuestion from "./CheckboxQuestion";

@ChildEntity(QuestionOptionType.CHECKBOX)
export default class CheckboxQuestionOption extends QuestionOption {
  @ManyToOne((_type) => CheckboxQuestion, (question) => question.options, {
    nullable: false,
  })
  question?: CheckboxQuestion;

  constructor(text: string, question: CheckboxQuestion) {
    super(text);
    this.question = question;
  }

  async getQuestion(): Promise<CheckboxQuestion> {
    return (
      await CheckboxQuestionOption.findOneOrFail(this.id, {
        relations: ["question"],
      })
    ).question!;
  }
}
