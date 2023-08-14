import { ChildEntity, ManyToOne } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import Review from "./Review";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

interface MultipleChoiceQuestionAnswerInterface {
  question: MultipleChoiceQuestion;
  review: Review;
  answer: MultipleChoiceQuestionOption;
}

@ChildEntity(QuestionAnswerType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => MultipleChoiceQuestionOption, {
    eager: true,
  })
  multipleChoiceAnswer: MultipleChoiceQuestionOption;

  init(init: MultipleChoiceQuestionAnswerInterface) {
    this.question = init.question;
    this.review = init.review;
    this.multipleChoiceAnswer = init.answer;
    return this;
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
    return MultipleChoiceQuestion.findOneByOrFail({
      id: questionId,
    });
  }

  getAnswerText(): string {
    return this.multipleChoiceAnswer.text;
  }

  async getAnswerPoints(): Promise<number | undefined> {
    const question = await this.getQuestion();
    if (!question.graded) {
      return undefined;
    } else {
      if (this.multipleChoiceAnswer.points == null) {
        throw new Error("The option doesn't have points");
      } else {
        return this.multipleChoiceAnswer.points;
      }
    }
  }
}
