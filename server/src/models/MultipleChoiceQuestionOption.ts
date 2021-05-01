import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import ResponseMessage from "../enum/ResponseMessage";

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

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    return MultipleChoiceQuestion.findOneOrFail(this.questionId);
  }
}
