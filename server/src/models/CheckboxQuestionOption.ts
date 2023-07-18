import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import CheckboxQuestion from "./CheckboxQuestion";

interface CheckboxQuestionOptionInterface {
  text: string;
  question: CheckboxQuestion;
  points: number | null;
}

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

  constructor(init?: CheckboxQuestionOptionInterface) {
    if (init !== undefined) {
      super({ text: init.text, points: init.points });
      this.question = init.question;
    }
  }

  async getQuestion(): Promise<CheckboxQuestion> {
    return CheckboxQuestion.findOneByOrFail({
      id: this.questionId,
    });
  }
}
