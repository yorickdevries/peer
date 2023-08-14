import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";
import Faculty from "./Faculty";
import AcademicYear from "./AcademicYear";
import Enrollment from "../models/Enrollment";
import Assignment from "../models/Assignment";
import UserRole from "../enum/UserRole";
import { AssignmentState } from "../enum/AssignmentState";

interface CourseInterface {
  name: string;
  courseCode: string;
  enrollable: boolean;
  faculty: Faculty;
  academicYear: AcademicYear;
  description: string | null;
}

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

  init(init: CourseInterface) {
    this.name = init.name;
    this.courseCode = init.courseCode;
    this.enrollable = init.enrollable;
    this.faculty = init.faculty;
    this.academicYear = init.academicYear;
    this.description = init.description;
    return this;
  }

  async getAssignments(): Promise<Assignment[]> {
    return await Assignment.find({ where: { course: { id: this.id } } });
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
      user: { netid: string };
      course: { id: number };
      role?: UserRole;
    } = { user: { netid: user.netid }, course: { id: this.id } };
    // add role to query if specified
    if (role) {
      where.role = role;
    }
    const enrollment = await Enrollment.findOne({
      where: where,
    });
    return enrollment ? true : false;
  }

  async getTeacherEnrollments(): Promise<Enrollment[]> {
    return await Enrollment.find({
      where: { course: { id: this.id }, role: UserRole.TEACHER },
    });
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

  /**
   * Returns the list of courses that a user is not yet enrolled in.
   *
   * @param user
   * @returns list of courses
   */
  static async getAdminEnrollable(user: User): Promise<Course[]> {
    // all courses
    const allCourses = await Course.find();
    const enrollableCourses = [];
    for (const course of allCourses) {
      if (!(await course.isEnrolled(user))) {
        enrollableCourses.push(course);
      }
    }
    return enrollableCourses;
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
