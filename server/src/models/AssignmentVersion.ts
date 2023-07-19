import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
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
import Assignment from "../models/Assignment";
import Submission from "./Submission";
import SubmissionQuestionnaire from "./SubmissionQuestionnaire";
import ReviewQuestionnaire from "./ReviewQuestionnaire";
import Group from "./Group";
import User from "./User";
import File from "../models/File";

interface AssignmentVersionInterface {
  name: string;
  assignment: Assignment;
  versionsToReview: AssignmentVersion[];
  reviewsPerUserPerAssignmentVersionToReview: number;
  selfReview: boolean;
  submissionQuestionnaire: SubmissionQuestionnaire | null;
  reviewQuestionnaire: ReviewQuestionnaire | null;
}

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

  constructor() {
    super();
  }

  init(init: AssignmentVersionInterface) {
    this.name = init.name;
    this.assignment = init.assignment;
    this.versionsToReview = init.versionsToReview;
    this.reviewsPerUserPerAssignmentVersionToReview =
      init.reviewsPerUserPerAssignmentVersionToReview;
    this.selfReview = init.selfReview;
    this.submissionQuestionnaire = init.submissionQuestionnaire;
    this.reviewQuestionnaire = init.reviewQuestionnaire;
    return this;
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
    return Assignment.findOneByOrFail({ id: this.assignmentId });
  }

  async getVersionsToReview(): Promise<AssignmentVersion[]> {
    // note: this might not be efficient, but its the only way I know how it can be done
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (await this.getAssignmentVersionWithVersionsToReview())
      .versionsToReview!;
  }

  private async getSubmissionsOfGroup(group: Group): Promise<Submission[]> {
    return Submission.find({
      where: {
        assignmentVersionId: this.id,
        groupId: group.id,
      },
    });
  }

  async getSubmissions(group?: Group): Promise<Submission[]> {
    if (group) {
      return this.getSubmissionsOfGroup(group);
    } else {
      return Submission.find({ where: { assignmentVersionId: this.id } });
    }
  }

  async deleteAllSubmissions(): Promise<void> {
    const ids = await Submission.createQueryBuilder("submissions")
      .select("fileId")
      .where("assignmentVersionId = :assignmentVersionId", {
        assignmentVersionId: this.id,
      })
      .execute();
    const fileIds = ids.map((idObject: { fileId: any }) => idObject.fileId);

    // delete submissions
    await Submission.createQueryBuilder("submissions")
      .delete()
      .from(Submission)
      .where("assignmentVersionId = :assignmentVersionId", {
        assignmentVersionId: this.id,
      })
      .execute();

    // delete associated files
    if (fileIds.length > 0) {
      await File.delete(fileIds);
    }
  }

  async deleteAllReviews(): Promise<void> {
    const subs = await Submission.createQueryBuilder("submissions")
      .where("assignmentVersionId = :assignmentVersionId", {
        assignmentVersionId: this.id,
      })
      .getMany();
    for (let i = 0; i < subs.length; i++) {
      await subs[i].deleteAllReviews();
    }
  }
  async deleteAllReviewEvals(): Promise<void> {
    const subs = await Submission.createQueryBuilder("submissions")
      .where("assignmentVersionId = :assignmentVersionId", {
        assignmentVersionId: this.id,
      })
      .getMany();
    for (let i = 0; i < subs.length; i++) {
      await subs[i].deleteAllReviewEvals();
    }
  }

  async getFinalSubmissionsOfEachGroup(): Promise<Submission[]> {
    return await Submission.find({
      where: { assignmentVersionId: this.id, final: true },
    });
  }

  async getFinalSubmission(group: Group): Promise<Submission | undefined> {
    const finalSubmissions = await Submission.find({
      where: { assignmentVersionId: this.id, groupId: group.id, final: true },
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
    return await AssignmentVersion.findOneOrFail({
      where: {
        id: this.id,
      },
      relations: { versionsToReview: true },
    });
  }

  async getSubmissionQuestionnaire(): Promise<SubmissionQuestionnaire | null> {
    if (!this.submissionQuestionnaireId) {
      return null;
    } else {
      return SubmissionQuestionnaire.findOneByOrFail({
        id: this.submissionQuestionnaireId,
      });
    }
  }

  async getReviewQuestionnaire(): Promise<ReviewQuestionnaire | null> {
    if (!this.reviewQuestionnaireId) {
      return null;
    } else {
      return ReviewQuestionnaire.findOneByOrFail({
        id: this.reviewQuestionnaireId,
      });
    }
  }
}
