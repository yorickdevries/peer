import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

@ChildEntity(QuestionOptionType.MULTIPLECHOICE)
export default class MultipleChoiceQuestionOption extends QuestionOption {
  @ManyToOne(
    (_type) => MultipleChoiceQuestion,
    (question) => question.options,
    {
      nullable: false,
    }
  )
  question?: MultipleChoiceQuestion;

  constructor(text: string) {
    super(text);
  }

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    return (
      await MultipleChoiceQuestionOption.findOneOrFail(this.id, {
        relations: ["question"],
      })
    ).question!;
  }
}
