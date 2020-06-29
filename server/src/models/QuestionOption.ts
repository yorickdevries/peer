import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  TableInheritance,
} from "typeorm";
import { IsOptional, IsDefined, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";
import QuestionOptionType from "../enum/QuestionType";
import Question from "./Question";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class QuestionOption extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  // id SERIAL,
  id?: number;

  @Column()
  // will be filled in by typeorm with the questionoptiontype
  type?: QuestionOptionType;

  // question varchar(5000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  abstract question?: Question;

  constructor(text: string) {
    super();
    this.text = text;
  }

  abstract getQuestion(): Promise<Question>;
}
