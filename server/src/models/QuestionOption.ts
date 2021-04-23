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
  IsNumber,
} from "class-validator";
import BaseModel from "./BaseModel";
import QuestionOptionType from "../enum/QuestionType";
import Question from "./Question";

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
  @Column("integer", { nullable: true })
  @IsInt()
  @IsNumber()
  @IsOptional()
  points: number | null;

  abstract question?: Question;

  constructor(text: string, points: number | null) {
    super();
    this.text = text;
    this.points = points;
  }

  abstract getQuestion(): Promise<Question>;
}
