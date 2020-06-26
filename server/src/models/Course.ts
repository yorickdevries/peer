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
import _ from "lodash";

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

  async isEnrolled(user: User, role?: UserRole): Promise<boolean> {
    const enrollment = await Enrollment.findOne({
      where: { userNetid: user.netid, courseId: this.id, role: role },
    });
    return enrollment ? true : false;
  }

  // get all enrolled courses for a certain user
  static async getEnrolled(user: User, role?: UserRole): Promise<Course[]> {
    // current enrollments for the user
    const enrollments = await Enrollment.find({
      relations: ["course"],
      where: { userNetid: user.netid, role: role },
    });
    // map the courses to a list of course ids
    return _.map(enrollments, "course") as Course[];
  }

  // get all enrollable courses for a certain user
  static async getEnrollable(user: User): Promise<Course[]> {
    // all enrollable courses
    const enrollableCourses = await this.find({
      where: {
        enrollable: true,
      },
    });
    // remove courses based on inactive academic years and already enrolled courses
    _.remove(enrollableCourses, async (course) => {
      return !course.academicYear?.active || (await course.isEnrolled(user));
    });
    return enrollableCourses;
  }
}
