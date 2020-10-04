import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from "typeorm";
import {
  IsDefined,
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from "class-validator";
import BaseModel from "./BaseModel";
import Assignment from "../models/Assignment";
import Submission from "./Submission";
import SubmissionQuestionnaire from "./SubmissionQuestionnaire";
import ReviewQuestionnaire from "./ReviewQuestionnaire";
import Group from "./Group";
import User from "./User";

@Entity()
export default class AssignmentVersion extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @RelationId(
    (assignmentVersion: AssignmentVersion) => assignmentVersion.assignment
  )
  assignmentId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Assignment, (assignment) => assignment.versions, {
    nullable: false,
  })
  assignment?: Assignment;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => AssignmentVersion)
  @JoinTable()
  versionsToReview?: AssignmentVersion[];

  // reviews_per_user int NOT NULL,
  @Column()
  @IsDefined()
  @IsInt()
  @IsPositive()
  reviewsPerUserPerAssignmentVersionToReview: number;

  // choose whether students review their own submissions
  @Column()
  @IsDefined()
  @IsBoolean()
  selfReview: boolean;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => Submission,
    (submission) => submission.assignmentVersion
  )
  submissions?: Submission[];

  // submission questionaire
  @RelationId(
    (assignmentVersion: AssignmentVersion) =>
      assignmentVersion.submissionQuestionnaire
  )
  submissionQuestionnaireId?: number; // this is undefined when questionnaire is null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => SubmissionQuestionnaire)
  @JoinColumn()
  submissionQuestionnaire?: SubmissionQuestionnaire | null;

  // review questionaire (for review evaluation)
  @RelationId(
    (assignmentVersion: AssignmentVersion) =>
      assignmentVersion.reviewQuestionnaire
  )
  reviewQuestionnaireId?: number; // this is undefined when questionnaire is null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => ReviewQuestionnaire)
  @JoinColumn()
  reviewQuestionnaire?: ReviewQuestionnaire | null;

  constructor(
    name: string,
    assignment: Assignment,
    versionsToReview: AssignmentVersion[],
    reviewsPerUserPerAssignmentVersionToReview: number,
    selfReview: boolean,
    submissionQuestionnaire: SubmissionQuestionnaire | null,
    reviewQuestionnaire: ReviewQuestionnaire | null
  ) {
    super();
    this.name = name;
    this.assignment = assignment;
    this.versionsToReview = versionsToReview;
    this.reviewsPerUserPerAssignmentVersionToReview = reviewsPerUserPerAssignmentVersionToReview;
    this.selfReview = selfReview;
    this.submissionQuestionnaire = submissionQuestionnaire;
    this.reviewQuestionnaire = reviewQuestionnaire;
  }

  // validation: check whether the group is in the assingment and the user in the group
  async validateOrReject(): Promise<void> {
    const assignment = this.assignment
      ? this.assignment
      : await this.getAssignment();
    const versionsToReview = this.versionsToReview
      ? this.versionsToReview
      : await this.getVersionsToReview();
    for (const assignmentVersion of versionsToReview) {
      if (assignmentVersion.assignmentId !== assignment.id) {
        throw new Error("Not all versions are of the right assignment");
      }
    }
    if (
      !assignment.reviewEvaluation &&
      (this.reviewQuestionnaire || this.reviewQuestionnaireId)
    ) {
      throw new Error(
        "reviewQuestionnaire is defined while reviewEvaluation is turned off"
      );
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getAssignment(): Promise<Assignment> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await AssignmentVersion.findOneOrFail(this.id, {
        relations: ["assignment"],
      })
    ).assignment!;
  }

  async getVersionsToReview(): Promise<AssignmentVersion[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await AssignmentVersion.findOneOrFail(this.id, {
        relations: ["versionsToReview"],
      })
    ).versionsToReview!;
  }

  private async getSubmissionsOfGroup(group: Group): Promise<Submission[]> {
    return Submission.find({
      where: {
        assignmentVersion: this,
        group: group,
      },
    });
  }

  async getSubmissions(group?: Group): Promise<Submission[]> {
    if (group) {
      return this.getSubmissionsOfGroup(group);
    } else {
      return Submission.find({ where: { assignmentVersion: this } });
    }
  }

  async getFinalSubmissionsOfEachGroup(): Promise<Submission[]> {
    return await Submission.find({
      where: { assignmentVersion: this, final: true },
    });
  }

  async getFinalSubmission(group: Group): Promise<Submission | undefined> {
    const finalSubmissions = await Submission.find({
      where: { assignmentVersion: this, group: group, final: true },
    });
    if (finalSubmissions.length === 0) {
      return undefined;
    } else if (finalSubmissions.length === 1) {
      return finalSubmissions[0];
    } else {
      throw new Error("There are multiple finalSubmissions");
    }
  }

  async isTeacherInCourse(user: User): Promise<boolean> {
    const assignment = await this.getAssignment();
    return await assignment.isTeacherInCourse(user);
  }

  async isTeacherOrTeachingAssistantInCourse(user: User): Promise<boolean> {
    const assignment = await this.getAssignment();
    return await assignment.isTeacherOrTeachingAssistantInCourse(user);
  }

  async getAssignmentVersionWithVersionsToReview(): Promise<AssignmentVersion> {
    return await AssignmentVersion.findOneOrFail(this.id, {
      relations: ["versionsToReview"],
    });
  }

  async getSubmissionQuestionnaire(): Promise<SubmissionQuestionnaire | null> {
    if (!this.submissionQuestionnaireId) {
      return null;
    } else {
      return SubmissionQuestionnaire.findOneOrFail(
        this.submissionQuestionnaireId
      );
    }
  }

  async getReviewQuestionnaire(): Promise<ReviewQuestionnaire | null> {
    if (!this.reviewQuestionnaireId) {
      return null;
    } else {
      return ReviewQuestionnaire.findOneOrFail(this.reviewQuestionnaireId);
    }
  }
}
