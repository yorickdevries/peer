import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany } from "typeorm";
import QuestionType from "../enum/QuestionType";
import CheckboxQuestionOption from "./CheckboxQuestionOption";
import ResponseMessage from "../enum/ResponseMessage";

@ChildEntity(QuestionType.CHECKBOX)
export default class CheckboxQuestion extends Question {
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => CheckboxQuestionOption,
    (checkboxQuestionOption) => checkboxQuestionOption.question,
    {
      eager: true,
    }
  )
  options!: CheckboxQuestionOption[];

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

  containsOption(option: CheckboxQuestionOption): boolean {
    return this.id === option.questionId;
  }
}
