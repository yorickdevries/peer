import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

@ChildEntity(QuestionOptionType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestionOption extends QuestionOption {
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => MultipleChoiceQuestion,
    (question) => question.options,
    {
      nullable: false,
    }
  )
  question?: MultipleChoiceQuestion;

  constructor(text: string, question: MultipleChoiceQuestion) {
    super(text);
    this.question = question;
  }

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await MultipleChoiceQuestionOption.findOneOrFail(this.id, {
        relations: ["question"],
      })
    ).question!;
  }
}
