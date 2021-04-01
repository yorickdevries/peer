import Questionnaire from "./Questionnaire";
import Question from "./Question";
import { ChildEntity, OneToMany, Column } from "typeorm";
import { IsDefined, IsBoolean } from "class-validator";
import QuestionType from "../enum/QuestionType";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";

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

  containsOption(option: MultipleChoiceQuestionOption): boolean {
    return this.id === option.questionId;
  }
}
