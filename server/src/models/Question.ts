import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  TableInheritance,
  getManager,
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
import QuestionOperation from "../enum/QuestionOperation";
import QuestionType from "../enum/QuestionType";
import Questionnaire from "./Questionnaire";

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

  getMaxPointsFromQuestion(): number | null {
    return null;
  }

  /**
   * "Open" space by reordering after the new question position.
   *
   * @param questions - The set of questions to potentially change the numbers of to make space
   * @param num - The number of the question where space is needed
   */
  orderMakeSpace(questions: Question[], num: number): void {
    questions.forEach((q) => {
      if (q.number >= num) q.number++;
    });
  }

  /**
   * "Close" space by reordering after the question position
   *
   * @param questions - The set of questions to potentially change the numbers of to make space
   */
  orderRemoveSpace(questions: Question[]): void {
    if (questions.length > 0 && questions[0].number > 1) {
      questions[0].number = 1;
    }
    for (let i = 0; i < questions.length - 1; i++) {
      if (questions[i + 1].number - questions[i].number > 1) {
        questions[i + 1].number = questions[i].number + 1;
      }
    }
  }

  /**
   * Change the question numbers to be in ascending order after a modification was made.
   *
   * @param operation - The performed operation
   */
  async reorder(operation: QuestionOperation): Promise<void> {
    const questionnaireId = this.questionnaireId
      ? this.questionnaireId
      : this.questionnaire?.id;

    await getManager().transaction(
      "READ COMMITTED",
      async (transactionalEntityManager) => {
        let questions: Question[] = await transactionalEntityManager
          .createQueryBuilder(Question, "q")
          .where("q.questionnaireId = :id", { id: questionnaireId })
          .orderBy("q.number")
          .getMany();

        questions = questions.filter((q) => q.id !== this.id);

        switch (operation) {
          case QuestionOperation.CREATE: {
            if (!questions.find((q) => q.number === this.number)) break;

            this.orderMakeSpace(questions, this.number);
            break;
          }
          case QuestionOperation.MODIFY: {
            this.orderRemoveSpace(questions);

            this.orderMakeSpace(questions, this.number);
            break;
          }
          case QuestionOperation.DELETE: {
            //"Close" extra space
            this.orderRemoveSpace(questions);
            break;
          }
        }

        //Ensures spaces > 1 cannot be created
        if (questions.length > 0) {
          const maxQuestion = questions[questions.length - 1];
          const newMaxNumber = maxQuestion.number + 1;
          if (this.number > newMaxNumber) {
            this.number = newMaxNumber;
            await transactionalEntityManager.save(this);
          }
        }

        for (const q of questions) {
          await transactionalEntityManager.save(q);
        }
      }
    );
  }
}
