import {
  Column,
  Entity,
  getManager,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  TableInheritance,
} from "typeorm";
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from "class-validator";
import BaseModel from "./BaseModel";
import Questionnaire from "./Questionnaire";
import QuestionType from "../enum/QuestionType";
import User from "./User";
import QuestionOperation from "../enum/QuestionOperation";

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

  // is question graded
  @Column()
  @IsDefined()
  @IsBoolean()
  graded: boolean;

  // Rubric_id int NOT NULL,
  @RelationId((question: Question) => question.questionnaire)
  questionnaireId!: number;
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    graded: boolean,
    questionnaire: Questionnaire
  ) {
    super();
    this.text = text;
    this.number = number;
    this.optional = optional;
    this.graded = graded;
    this.questionnaire = questionnaire;
  }

  async getQuestionnaire(): Promise<Questionnaire> {
    return Questionnaire.findOneOrFail(this.questionnaireId);
  }

  // checks whether the user is teacher
  // of the corresponding questionnaire/assignment/course
  async isTeacherInCourse(user: User): Promise<boolean> {
    const questionnaire = await this.getQuestionnaire();
    return await questionnaire.isTeacherInCourse(user);
  }

  orderMakeSpace(questions: Question[], num: number) {
    questions.map((q) => {
      if (q.number >= num) q.number++;
      return q;
    });
  }

  orderRemoveSpace(questions: Question[], num: number) {
    questions.map((q) => {
      if (q.number > num) q.number--;
      return q;
    });
  }

  async saveAndOrder(operation: QuestionOperation): Promise<Question> {
    const questionnaireId = this.questionnaireId
      ? this.questionnaireId
      : this.questionnaire?.id;
    let questions: Question[] = await getManager()
      .createQueryBuilder(Question, "q")
      .where("q.questionnaireId = :id", { id: questionnaireId })
      .orderBy("q.number")
      .getMany();

    const oldQuestion = questions.find((q) => q.id === this.id);
    const sameNumQuestion = questions.find((q) => q.number === this.number);

    switch (operation) {
      case QuestionOperation.CREATE: {
        if (!sameNumQuestion) break;

        this.orderMakeSpace(questions, this.number);
        break;
      }
      case QuestionOperation.MODIFY: {
        if (!oldQuestion) break;
        questions = questions.filter((q) => q.id !== this.id);

        //"Close" space by reordering after the old question position
        if (questions.find((q) => q.number > oldQuestion.number)) {
          this.orderRemoveSpace(questions, oldQuestion.number);
        }
        //"Open" space by reordering after the new question position
        if (sameNumQuestion) {
          this.orderMakeSpace(questions, this.number);
        }
        break;
      }
      case QuestionOperation.DELETE: {
        if (!oldQuestion) break;
        questions = questions.filter((q) => q.id !== this.id);

        if (questions.find((q) => q.number > this.number)) {
          this.orderRemoveSpace(questions, this.number);
        }
        break;
      }
    }
    for (const q of questions) {
      await q.save();
    }

    if (operation !== QuestionOperation.DELETE) {
      return this.save();
    } else {
      return this.remove();
    }
  }
}
