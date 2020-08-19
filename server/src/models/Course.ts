import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import {
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Faculty from "./Faculty";
import AcademicYear from "./AcademicYear";
import Enrollment from "../models/Enrollment";
import Assignment from "../models/Assignment";
import UserRole from "../enum/UserRole";
import { AssignmentState } from "../enum/AssignmentState";

@Entity()
export default class Course extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @Column()
  @IsDefined()
  @IsBoolean()
  enrollable: boolean;

  @Column("text", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string | null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => Faculty, {
    eager: true,
    nullable: false,
  })
  @IsDefined()
  faculty: Faculty;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => AcademicYear, {
    eager: true,
    nullable: false,
  })
  @IsDefined()
  academicYear: AcademicYear;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => Assignment, (assignment) => assignment.course)
  assignments?: Assignment[];

  constructor(
    name: string,
    courseCode: string,
    enrollable: boolean,
    faculty: Faculty,
    academicYear: AcademicYear,
    description: string | null
  ) {
    super();
    this.name = name;
    this.courseCode = courseCode;
    this.enrollable = enrollable;
    this.faculty = faculty;
    this.academicYear = academicYear;
    this.description = description;
  }

  async getAssignments(): Promise<Assignment[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (
      await Course.findOneOrFail(this.id, {
        relations: ["assignments"],
      })
    ).assignments!;
  }

  async getEnrollableAssignments(user: User): Promise<Assignment[]> {
    const allAssignments = await this.getAssignments();
    const enrollableAssignments = [];
    for (const assignment of allAssignments) {
      if (await assignment.isEnrollable(user)) {
        enrollableAssignments.push(assignment);
      }
    }
    return enrollableAssignments;
  }

  async getPublishedEnrolledAssignments(user: User): Promise<Assignment[]> {
    const allAssignments = await this.getAssignments();
    const enrolledAssignments = [];
    for (const assignment of allAssignments) {
      if (
        (await assignment.isEnrolledInGroup(user)) &&
        !assignment.isAtState(AssignmentState.UNPUBLISHED)
      ) {
        enrolledAssignments.push(assignment);
      }
    }
    return enrolledAssignments;
  }

  async isEnrollable(user: User): Promise<boolean> {
    return (
      this.academicYear?.active &&
      this.enrollable &&
      !(await this.isEnrolled(user))
    );
  }

  async isEnrolled(user: User, role?: UserRole): Promise<boolean> {
    const where: {
      user: User;
      course: Course;
      role?: UserRole;
    } = { user: user, course: this };
    // add role to query if specified
    if (role) {
      where.role = role;
    }
    const enrollment = await Enrollment.findOne({
      where: where,
    });
    return enrollment ? true : false;
  }

  async isTeacher(user: User): Promise<boolean> {
    return this.isEnrolled(user, UserRole.TEACHER);
  }

  async isTeacherOrTeachingAssistant(user: User): Promise<boolean> {
    return (
      (await this.isEnrolled(user, UserRole.TEACHER)) ||
      (await this.isEnrolled(user, UserRole.TEACHING_ASSISTANT))
    );
  }

  // get all enrollable courses for a certain user
  static async getEnrollable(user: User): Promise<Course[]> {
    // all enrollable courses
    const allEnrollableCourses = await Course.find({
      where: {
        enrollable: true,
      },
    });
    // pick the courses which are active and not enrolled
    const enrollableCourses = [];
    for (const course of allEnrollableCourses) {
      if (await course.isEnrollable(user)) {
        enrollableCourses.push(course);
      }
    }
    return enrollableCourses;
  }
}
