import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId, Column } from "typeorm";
import { IsNumber } from "class-validator";
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

  // number of points awarded for this option
  @Column()
  @IsNumber()
  points: number;

  question?: MultipleChoiceQuestion;

  constructor(text: string, question: MultipleChoiceQuestion, points: number) {
    super(text);
    this.question = question;
    this.points = points;
  }

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    return MultipleChoiceQuestion.findOneOrFail(this.questionId);
  }
}
