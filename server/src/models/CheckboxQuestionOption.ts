import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId, Column } from "typeorm";
import { IsNumber } from "class-validator";
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

  // number of points awarded for this option
  @Column()
  @IsNumber()
  points: number;

  question?: CheckboxQuestion;

  constructor(text: string, question: CheckboxQuestion, points: number) {
    super(text);
    this.question = question;
    this.points = points;
  }

  async getQuestion(): Promise<CheckboxQuestion> {
    return CheckboxQuestion.findOneOrFail(this.questionId);
  }
}
