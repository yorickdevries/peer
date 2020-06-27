import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
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
import UserRole from "../enum/UserRole";

@Entity()
export default class Course extends BaseModel {
  @PrimaryGeneratedColumn()
  @IsOptional()
  id?: number;

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

  @ManyToOne((_type) => Faculty, {
    eager: true,
    nullable: false,
  })
  faculty: Faculty;

  @ManyToOne((_type) => AcademicYear, {
    eager: true,
    nullable: false,
  })
  academicYear: AcademicYear;

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

  async isEnrollable(user: User): Promise<boolean> {
    return (
      this.academicYear?.active &&
      this.enrollable &&
      !(await this.isEnrolled(user))
    );
  }

  async isEnrolled(user: User, role?: UserRole): Promise<boolean> {
    // if this.id isnt instantiated no user can be enrolled
    if (!this.id) {
      return false;
    }
    const where: {
      userNetid: string;
      courseId: number;
      role?: UserRole;
    } = { userNetid: user.netid, courseId: this.id };
    // add role to query if specified
    if (role) {
      where.role = role;
    }
    const enrollment = await Enrollment.findOne({
      where: where,
    });
    return enrollment ? true : false;
  }

  // get all enrollable courses for a certain user
  static async getEnrollable(user: User): Promise<Course[]> {
    // all enrollable courses
    const allEnrollableCourses = await this.find({
      where: {
        enrollable: true,
      },
    });
    // pick the courses which are active and not enrolled
    const enrollableCourses = [];
    for (const course of allEnrollableCourses) {
      // add courses based on active academic years and not already enrolled courses
      if (await course.isEnrollable(user)) {
        enrollableCourses.push(course);
      }
    }
    return enrollableCourses;
  }
}
