import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

@ChildEntity(QuestionOptionType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestionOption extends QuestionOption {
  @RelationId(
    (multipleChoiceQuestionOption: MultipleChoiceQuestionOption) =>
      multipleChoiceQuestionOption.question
  )
  questionId!: number;
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => MultipleChoiceQuestion,
    (question) => question.options,
    {
      nullable: false,
    }
  )
  question?: MultipleChoiceQuestion;

  constructor(
    text: string,
    question: MultipleChoiceQuestion,
    points: number | null
  ) {
    super(text, points);
    this.question = question;
  }

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    return MultipleChoiceQuestion.findOneOrFail(this.questionId);
  }
}
