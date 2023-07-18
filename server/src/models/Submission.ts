import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  getManager,
} from "typeorm";
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import AssignmentVersion from "../models/AssignmentVersion";
import Group from "./Group";
import File from "./File";
import ReviewOfSubmission from "./ReviewOfSubmission";
import ServerFlagReason from "../enum/ServerFlagReason";
import QuestionAnswer from "./QuestionAnswer";
import ReviewOfReview from "./ReviewOfReview";
import { dataSource } from "../databaseConnection";

interface SubmissionInterface {
  user: User;
  group: Group;
  assignmentVersion: AssignmentVersion;
  file: File;
  final: boolean;
}

@Entity()
export default class Submission extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  // User_netid varchar(500) NOT NULL,
  @RelationId((submission: Submission) => submission.user)
  userNetid!: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // Group_id int NOT NULL,
  @RelationId((submission: Submission) => submission.group)
  groupId!: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Group, { nullable: false })
  group?: Group;

  // Assignment_id int NOT NULL,
  @RelationId((submission: Submission) => submission.assignmentVersion)
  assignmentVersionId!: number;
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => AssignmentVersion,
    (assignmentVersion) => assignmentVersion.submissions,
    {
      nullable: false,
    }
  )
  assignmentVersion?: AssignmentVersion;

  // file_path varchar(500) NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  @IsDefined()
  file: File;

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => ReviewOfSubmission,
    (reviewOfSubmission) => reviewOfSubmission.submission
  )
  reviewOfSubmissions?: ReviewOfSubmission[];

  @Column()
  @IsDefined()
  @IsBoolean()
  final: boolean;

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

  @Column("boolean", { nullable: true })
  @IsOptional()
  @IsBoolean()
  flaggedByServer: boolean | null;

  @Column("text", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEnum(ServerFlagReason)
  commentByServer: ServerFlagReason | null;

  constructor(init?: SubmissionInterface) {
    if (init !== undefined) {
      super();
      this.user = init.user;
      this.group = init.group;
      this.assignmentVersion = init.assignmentVersion;
      this.file = init.file;
      this.final = init.final;
      // set default on null
      this.approvalByTA = null;
      this.commentByTA = null;
      this.approvingTA = null;
      this.flaggedByServer = null;
      this.commentByServer = null;
    }
  }

  // validation: check whether the group is in the assingment and the user in the group
  async validateOrReject(): Promise<void> {
    const group = this.group ? this.group : await this.getGroup();
    const user = this.user ? this.user : await this.getUser();
    const assignmentVersion = this.assignmentVersion
      ? this.assignmentVersion
      : await this.getAssignmentVersion();
    const assignment = await assignmentVersion.getAssignment();
    // might need to be changed if a teacher submits on behalf of a group
    if (
      !(await group.hasUser(user)) &&
      !(await assignment.isTeacherInCourse(user))
    ) {
      throw new Error("User is not part of this group");
    }
    if (!(await group.hasAssignment(assignment))) {
      throw new Error("Group is not part of this assignment");
    }
    // check if the file has the right extension
    const submissionExtensions =
      assignment.submissionExtensions.split(/\s*,\s*/);
    if (
      !submissionExtensions.includes(this.file.extension) &&
      !submissionExtensions.includes(".*")
    ) {
      throw new Error("The file is of the wrong extension");
    }
    const course = await assignment.getCourse();
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

    if (this.flaggedByServer) {
      if (this.commentByServer === null) {
        throw new Error(
          "A server comment should be set if the submission is flagged."
        );
      }
    } else {
      if (this.commentByServer !== null) {
        throw new Error(
          "A server comment should not be set if the submission is flagged."
        );
      }
    }
    // if it succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getGroup(): Promise<Group> {
    return Group.findOneByOrFail({
      id: this.groupId,
    });
  }

  async getAssignmentVersion(): Promise<AssignmentVersion> {
    return AssignmentVersion.findOneByOrFail({
      id: this.assignmentVersionId,
    });
  }

  async getUser(): Promise<User> {
    return User.findOneByOrFail({
      netid: this.userNetid,
    });
  }

  async getReviewOfSubmissions(): Promise<ReviewOfSubmission[]> {
    return ReviewOfSubmission.find({ where: { submission: { id: this.id } } });
  }

  async isTeacherOrTeachingAssistantInCourse(user: User): Promise<boolean> {
    const assignmentVersion = await this.getAssignmentVersion();
    return await assignmentVersion.isTeacherOrTeachingAssistantInCourse(user);
  }

  async isTeacherInCourse(user: User): Promise<boolean> {
    const assignmentVersion = await this.getAssignmentVersion();
    return await assignmentVersion.isTeacherInCourse(user);
  }
  async deleteAllReviews(): Promise<void> {
    const ids = await ReviewOfSubmission.createQueryBuilder("review")
      .select("review.id", "rid")
      .where("review.submissionId = :submissionId", {
        submissionId: this.id,
      })
      .execute();
    const reviewIds = ids.map((idObject: { rid: any }) => idObject.rid);

    if (reviewIds.length > 0) {
      await dataSource.getRepository(QuestionAnswer).createQueryBuilder()
        .delete()
        .where("reviewId IN (:...idValues)", { idValues: reviewIds })
        .execute();
    }

    await ReviewOfSubmission.createQueryBuilder()
      .delete()
      .where("submissionId = :submissionId", {
        submissionId: this.id,
      })
      .execute();
  }
  async deleteAllReviewEvals(): Promise<void> {
    // get all reviews for this submission
    const ids = await ReviewOfSubmission.createQueryBuilder("review")
      .select("review.id", "rid")
      .where("review.submissionId = :submissionId", {
        submissionId: this.id,
      })
      .execute();

    if (ids.length !== 0) {
      const reviewIds = ids.map((idObject: { rid: any }) => idObject.rid);

      // get all review evaluations for this submission
      const feedbackReviews = await ReviewOfReview.createQueryBuilder("review")
        .select("review.id", "rid")
        .where("reviewOfSubmissionId IN (:...idValues)", {
          idValues: reviewIds,
        })
        .execute();

      const feedbackReviewIds = feedbackReviews.map(
        (idObject: { rid: any }) => idObject.rid
      );

      if (feedbackReviewIds.length > 0) {
        await dataSource.getRepository(QuestionAnswer).createQueryBuilder()
          .delete()
          .where("reviewId IN (:...idValues)", { idValues: feedbackReviewIds })
          .execute();

        await ReviewOfReview.createQueryBuilder()
          .delete()
          .where("reviewOfSubmissionId IN (:...idValues)", {
            idValues: reviewIds,
          })
          .execute();
      }
    }
  }

  /**
   * Returns a boolean indicating whether a group has made a submission
   *
   * @param groupId the group id
   * @returns whether the group has made a submission
   */
  static async hasGroupMadeSubmission(groupId: number): Promise<boolean> {
    const group = await getManager()
      .createQueryBuilder(Submission, "submission")
      .leftJoin("submission.group", "group")
      .where("group.id = :id", { id: groupId })
      .getOne();
    return !!group;
  }
}
