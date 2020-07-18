import { ChildEntity, ManyToOne } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import Review from "./Review";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

@ChildEntity(QuestionAnswerType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => MultipleChoiceQuestionOption, {
    eager: true,
  })
  multipleChoiceAnswer: MultipleChoiceQuestionOption;

  constructor(
    question: MultipleChoiceQuestion,
    review: Review,
    answer: MultipleChoiceQuestionOption
  ) {
    super(question, review);
    this.multipleChoiceAnswer = answer;
  }

  async validateOrReject(): Promise<void> {
    // validation: options should be part of question
    const question = await this.getQuestion();
    if (!question.containsOption(this.multipleChoiceAnswer)) {
      throw new Error("The questionOption is not part of this question");
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getQuestion(): Promise<MultipleChoiceQuestion> {
    const questionId = this.question ? this.question.id : this.questionId;
    return MultipleChoiceQuestion.findOneOrFail(questionId);
  }

  getAnswerText(): string {
    return this.multipleChoiceAnswer.text;
  }
}
