import QuestionOption from "./QuestionOption";
import { ChildEntity, ManyToOne, RelationId } from "typeorm";
import QuestionOptionType from "../enum/QuestionOptionType";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

interface MultipleChoiceQuestionOptionInterface {
  text: string;
  question: MultipleChoiceQuestion;
  points: number | null;
}

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

  constructor() {
    super();
  }

  init(init: MultipleChoiceQuestionOptionInterface) {
    this.text = init.text;
    this.points = init.points;
    this.question = init.question;
    return this;
  }

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    return MultipleChoiceQuestion.findOneByOrFail({
      id: this.questionId,
    });
  }
}
