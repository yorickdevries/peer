import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  TableInheritance,
} from "typeorm";
import {
  IsDefined,
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import BaseModel from "./BaseModel";
import QuestionOptionType from "../enum/QuestionType";
import Question from "./Question";
import ResponseMessage from "../enum/ResponseMessage";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class QuestionOption extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  @Column()
  // will be filled in by typeorm with the questionoptiontype
  type!: QuestionOptionType;

  // question varchar(5000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  // number of points awarded for this option
  @Column("int", { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100) // value needs to be between -100 and 100
  points: number | null;

  abstract question?: Question;

  constructor(text: string, points: number | null) {
    super();
    this.text = text;
    this.points = points;
  }

  async validateOrReject(): Promise<void> {
    const question = this.question ? this.question : await this.getQuestion();
    if (question.graded && this.points == null) {
      throw new Error(ResponseMessage.NON_GRADED_OPTION_FOR_QUESTION_GRADED);
    } else if (!question.graded && this.points !== null) {
      throw new Error(ResponseMessage.GRADED_OPTION_FOR_NON_QUESTION_GRADED);
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  abstract getQuestion(): Promise<Question>;
}
