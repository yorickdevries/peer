import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";
import ResponseMessage from "../enum/ResponseMessage";

@ChildEntity(QuestionType.MULTIPLE_CHOICE)
export default class MultipleChoiceQuestion extends Question {
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => MultipleChoiceQuestionOption,
    (multipleChoiceQuestionOption) => multipleChoiceQuestionOption.question,
    {
      eager: true,
    }
  )
  options!: MultipleChoiceQuestionOption[];

  constructor(
    text: string,
    number: number,
    optional: boolean,
    graded: boolean,
    questionnaire: Questionnaire
  ) {
    super(text, number, optional, graded, questionnaire);
  }

  async validateOrReject(): Promise<void> {
    // if not initialized, the question has just been created
    if (this.options) {
      for (const questionOption of this.options) {
        if (this.graded && questionOption.points == null) {
          throw new Error(
            ResponseMessage.NON_GRADED_OPTION_FOR_QUESTION_GRADED
          );
        } else if (!this.graded && questionOption.points !== null) {
          throw new Error(
            ResponseMessage.GRADED_OPTION_FOR_NON_QUESTION_GRADED
          );
        }
      }
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  containsOption(option: MultipleChoiceQuestionOption): boolean {
    return this.id === option.questionId;
  }

  getMaxPointsFromQuestion(): number | null {
    const optionPoints: number[] | null = this.options.every(
      (points) => points !== null
    )
      ? this.options.map(
          (multipleChoiceAnswer) => multipleChoiceAnswer.points as number
        )
      : null;
    if (optionPoints) {
      return Math.max(...optionPoints);
    }
    return null;
  }
}
