import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany, Column } from "typeorm";
import { IsDefined, IsBoolean } from "class-validator";
import QuestionType from "../enum/QuestionType";
import CheckboxQuestionOption from "./CheckboxQuestionOption";

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

  // is question graded
  @Column()
  @IsDefined()
  @IsBoolean()
  graded: boolean;

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire,
    graded: boolean
  ) {
    super(text, number, optional, questionnaire);
    this.graded = graded;
  }

  containsOption(option: CheckboxQuestionOption): boolean {
    return this.id === option.questionId;
  }
}
