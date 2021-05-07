import { ChildEntity, ManyToMany, JoinTable } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import CheckboxQuestionOption from "./CheckboxQuestionOption";
import CheckboxQuestion from "./CheckboxQuestion";

@ChildEntity(QuestionAnswerType.CHECKBOX)
export default class CheckboxQuestionAnswer extends QuestionAnswer {
  // answer int NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => CheckboxQuestionOption, { eager: true })
  @JoinTable()
  checkboxAnswer: CheckboxQuestionOption[];

  constructor(
    question: CheckboxQuestion,
    review: Review,
    answer: CheckboxQuestionOption[]
  ) {
    super(question, review);
    this.checkboxAnswer = answer;
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
    return CheckboxQuestion.findOneOrFail(questionId);
  }

  getAnswerText(): string {
    const answer = [];
    for (const option of this.checkboxAnswer) {
      answer.push(option.text);
    }
    return String(answer);
  }

  getAnswerPoints(): number[] {
    let pointsSum = 0;
    const points = [];
    for (const option of this.checkboxAnswer) {
      if (option.points != null) {
        points.push(option.points);
        pointsSum += option.points;
      } else {
        return [];
      }
    }
    return [pointsSum, ...points];
  }
}
