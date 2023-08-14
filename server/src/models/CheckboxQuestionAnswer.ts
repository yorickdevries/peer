import { ChildEntity, JoinTable, ManyToMany } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import CheckboxQuestionOption from "./CheckboxQuestionOption";
import CheckboxQuestion from "./CheckboxQuestion";

interface CheckboxQuestionAnswerInterface {
  question: CheckboxQuestion;
  review: Review;
  answer: CheckboxQuestionOption[];
}
@ChildEntity(QuestionAnswerType.CHECKBOX)
export default class CheckboxQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => CheckboxQuestionOption, { eager: true })
  @JoinTable()
  checkboxAnswer: CheckboxQuestionOption[];

  init(init: CheckboxQuestionAnswerInterface) {
    this.question = init.question;
    this.review = init.review;
    this.checkboxAnswer = init.answer;
    return this;
  }

  async validateOrReject(): Promise<void> {
    // validation: options should be part of question
    const question = await this.getQuestion();
    for (const questionOption of this.checkboxAnswer) {
      if (!question.containsOption(questionOption)) {
        throw new Error("The questionOption is not part of this question");
      }
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getQuestion(): Promise<CheckboxQuestion> {
    const questionId = this.question ? this.question.id : this.questionId;
    return CheckboxQuestion.findOneByOrFail({
      id: questionId,
    });
  }

  getAnswerText(): string {
    const answer = [];
    for (const option of this.checkboxAnswer) {
      answer.push(option.text);
    }
    return String(answer);
  }

  // method specifically made for checkboxquestionanswers as there are multiple options possible
  async getAnswerPointsList(): Promise<number[] | undefined> {
    const question = await this.getQuestion();
    if (!question.graded) {
      return undefined;
    } else {
      const points = [];
      for (const option of this.checkboxAnswer) {
        if (option.points == null) {
          throw new Error("The option doesn't have points");
        } else {
          points.push(option.points);
        }
      }
      return points;
    }
  }

  async getAnswerPoints(): Promise<number | undefined> {
    const pointsList = await this.getAnswerPointsList();
    return pointsList == undefined
      ? undefined
      : pointsList.reduce((a, b) => a + b, 0);
  }
}
