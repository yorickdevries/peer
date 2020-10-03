import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
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
import Group from "./Group";
import _ from "lodash";
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

  constructor(
    name: string,
    assignment: Assignment,
    versionsToReview: AssignmentVersion[],
    reviewsPerUserPerAssignmentVersionToReview: number,
    selfReview: boolean
  ) {
    super();
    this.name = name;
    this.assignment = assignment;
    this.versionsToReview = versionsToReview;
    this.reviewsPerUserPerAssignmentVersionToReview = reviewsPerUserPerAssignmentVersionToReview;
    this.selfReview = selfReview;
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

  async getSubmissions(group?: Group): Promise<Submission[]> {
    if (group) {
      return this.getSubmissionsOfGroup(group);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return (
        await AssignmentVersion.findOneOrFail(this.id, {
          relations: ["submissions"],
        })
      ).submissions!;
    }
  }

  async getLatestSubmissionsOfEachGroup(): Promise<Submission[]> {
    const latestSubmissionsOfEachGroup: Submission[] = [];
    const assignment = await this.getAssignment();
    const groups = await assignment.getGroups();
    for (const group of groups) {
      const latestSubmission = await this.getLatestSubmission(group);
      if (latestSubmission) {
        latestSubmissionsOfEachGroup.push(latestSubmission);
      }
    }
    return latestSubmissionsOfEachGroup;
  }

  async getLatestSubmission(group: Group): Promise<Submission | undefined> {
    const submissions = await this.getSubmissions(group);
    const latestSubmission = _.maxBy(submissions, "id");
    return latestSubmission;
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

  private async getSubmissionsOfGroup(group: Group): Promise<Submission[]> {
    return Submission.find({
      where: {
        assignmentVersion: this,
        group: group,
      },
    });
  }
}
