import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  TableInheritance,
} from "typeorm";
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import ReviewType from "../enum/ReviewType";
import Questionnaire from "./Questionnaire";
import UserRole from "../enum/UserRole";
import QuestionAnswer from "./QuestionAnswer";
import Question from "./Question";
import _ from "lodash";

interface AnonymousReview {
  id: number;
  flaggedByReviewer: boolean;
  submitted: boolean;
  approvalByTA: boolean | null;
  commentByTA: string | null;
  questionnaireId: number;
}

interface AnonymousReviewWithReviewer extends AnonymousReview {
  reviewerNetid: string;
}

// formely called rubric
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export default abstract class Review extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  @Column()
  // will be filled in by typeorm with the QuestionnaireType
  type!: ReviewType;

  // Rubric_id int NOT NULL,
  @RelationId((review: Review) => review.questionnaire)
  questionnaireId!: number;
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => Questionnaire,
    (questionnaire) => questionnaire.reviews,
    { nullable: false }
  )
  questionnaire?: Questionnaire;

  // User_netid varchar(500) NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, {
    nullable: false,
    eager: true,
  })
  reviewer: User;

  // flagged BOOLEAN NOT NULL DEFAULT FALSE,
  @Column()
  @IsDefined()
  @IsBoolean()
  flaggedByReviewer: boolean;

  // done BOOLEAN NOT NULL DEFAULT FALSE,
  @Column()
  @IsDefined()
  @IsBoolean()
  submitted: boolean;

  // started_at timestamptz,
  @Column({
    type: "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  startedAt: Date | null;

  // downloaded_at timestamptz,
  @Column({
    type: "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  downloadedAt: Date | null;

  // submitted_at timestamptz,
  @Column({
    type: "timestamp",
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  submittedAt: Date | null;

  // approved boolean,
  @Column("boolean", { nullable: true })
  @IsOptional()
  @IsBoolean()
  approvalByTA: boolean | null;

  // ta text comment,
  @Column("text", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  commentByTA: string | null;

  // ta_netid varchar(500),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { eager: true })
  approvingTA: User | null;

  // cannot be eager as this casues 'ER_BAD_NULL_ERROR's
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => QuestionAnswer,
    (questionAnswer) => questionAnswer.review, { cascade: true }
  )
  questionAnswers?: QuestionAnswer[];

  abstract isReviewed(user: User): Promise<boolean>;

  constructor(
    questionnaire: Questionnaire,
    reviewer: User,
    flaggedByReviewer: boolean,
    submitted: boolean,
    startedAt: Date | null,
    downloadedAt: Date | null,
    submittedAt: Date | null
  ) {
    super();
    this.questionnaire = questionnaire;
    this.reviewer = reviewer;
    this.flaggedByReviewer = flaggedByReviewer;
    this.submitted = submitted;
    this.startedAt = startedAt;
    this.downloadedAt = downloadedAt;
    this.submittedAt = submittedAt;
    // set default on null
    this.approvalByTA = null;
    this.commentByTA = null;
    this.approvingTA = null;
  }

  // custom validation which is run before saving
  async validateOrReject(): Promise<void> {
    const questionnaire = this.questionnaire
      ? this.questionnaire
      : await this.getQuestionnaire();
    const assignmentVersion = await questionnaire.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
    const course = await assignment.getCourse();
    if (!(await course.isEnrolled(this.reviewer, UserRole.STUDENT))) {
      throw new Error(
        `${this.reviewer.netid} should be enrolled in the course`
      );
    }
    if (this.approvingTA && this.approvalByTA === null) {
      throw new Error("Approval should be set");
    }
    if (
      !this.approvingTA &&
      (this.approvalByTA !== null || this.commentByTA !== null)
    ) {
      throw new Error("Approving TA should be set");
    }
    if (this.approvingTA) {
      if (!(await course.isTeacherOrTeachingAssistant(this.approvingTA))) {
        throw new Error(
          `${this.approvingTA.netid} should be enrolled in the course`
        );
      }
    }
    // check whether the review is allowed to be submitted
    if (this.submitted && !(await this.canBeSubmitted())) {
      throw new Error("A non-optional question isn't answered yet.");
    }
    // submitted and submittedAt
    if (this.submitted && !this.submittedAt) {
      throw new Error("submittedAt needs to be defined");
    }
    if (!this.submitted && this.submittedAt) {
      throw new Error("submittedAt needs to be null");
    }
    // if all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async canBeSubmitted(): Promise<boolean> {
    // check whether the review is allowed to be submitted
    if (!this.flaggedByReviewer) {
      // check whether all non-optional questions are answered
      const answers = await this.getQuestionAnswers();
      const questionnaire = await this.getQuestionnaire();
      for (const question of questionnaire.questions) {
        // only check question if not optional
        if (!question.optional) {
          const answer = _.find(answers, (answer) => {
            return answer.questionId === question.id;
          });
          // if no answer is present, return false
          if (!answer) {
            return false;
          }
        }
      }
    }
    return true;
  }

  async getQuestionnaire(): Promise<Questionnaire> {
    return Questionnaire.findOneOrFail(this.questionnaireId);
  }

  async getQuestionAnswers(): Promise<QuestionAnswer[]> {
    return QuestionAnswer.find({ where: { review: this } });
  }

  // checks whether the user is teacher
  async isTeacherInCourse(user: User): Promise<boolean> {
    const questionnaire = await this.getQuestionnaire();
    return await questionnaire.isTeacherInCourse(user);
  }

  async isTeacherOrTeachingAssistantInCourse(user: User): Promise<boolean> {
    const questionnaire = await this.getQuestionnaire();
    return await questionnaire.isTeacherOrTeachingAssistantInCourse(user);
  }

  // checks whether the user is the reviewer
  isReviewer(user: User): boolean {
    return this.reviewer.netid === user.netid;
  }

  getAnonymousVersion(): AnonymousReview {
    return {
      id: this.id,
      flaggedByReviewer: this.flaggedByReviewer,
      submitted: this.submitted,
      approvalByTA: this.approvalByTA,
      commentByTA: this.commentByTA,
      questionnaireId: this.questionnaireId,
    };
  }

  getAnonymousVersionWithReviewerNetid(): AnonymousReviewWithReviewer {
    return {
      id: this.id,
      flaggedByReviewer: this.flaggedByReviewer,
      submitted: this.submitted,
      approvalByTA: this.approvalByTA,
      commentByTA: this.commentByTA,
      questionnaireId: this.questionnaireId,
      reviewerNetid: this.reviewer.netid,
    };
  }

  async getAnswer(question: Question): Promise<QuestionAnswer | undefined> {
    return QuestionAnswer.findOne({
      where: { review: this, question: question },
    });
  }
}
