import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  TableInheritance,
} from "typeorm";
import {
  IsDefined,
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsBoolean,
} from "class-validator";
import BaseModel from "./BaseModel";
import Questionnaire from "./Questionnaire";
import QuestionType from "../enum/QuestionType";
import User from "./User";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Question extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  @Column()
  // will be filled in by typeorm with the questiontype
  type!: QuestionType;

  // question varchar(5000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  // question_number int NOT NULL,
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  number: number;

  // optional boolean NOT NULL,
  @Column()
  @IsDefined()
  @IsBoolean()
  optional: boolean;

  // Rubric_id int NOT NULL,
  @ManyToOne(
    (_type) => Questionnaire,
    (questionnaire) => questionnaire.questions,
    {
      nullable: false,
    }
  )
  questionnaire?: Questionnaire;

  constructor(
    text: string,
    number: number,
    optional: boolean,
    questionnaire: Questionnaire
  ) {
    super();
    this.text = text;
    this.number = number;
    this.optional = optional;
    this.questionnaire = questionnaire;
  }

  async getQuestionnaire(): Promise<Questionnaire> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Question.findOneOrFail(this.id, {
        relations: ["questionnaire"],
      })
    ).questionnaire!;
  }

  // checks whether the user is teacher
  // of the corresponding questionnaire/assignment/course
  async isTeacherInCourse(user: User): Promise<boolean> {
    const questionnaire = await this.getQuestionnaire();
    return await questionnaire.isTeacherInCourse(user);
  }
}
