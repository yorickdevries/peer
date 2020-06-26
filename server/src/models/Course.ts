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
  description?: string | null;

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
    description?: string | null
  ) {
    super();
    this.name = name;
    this.courseCode = courseCode;
    this.enrollable = enrollable;
    this.faculty = faculty;
    this.academicYear = academicYear;
    this.description = description;
  }

  // get all enrollable courses for a certain user
  static async getEnrollableCourses(user: User): Promise<Course[]> {
    // current enrollments for the user
    const enrollments = await Enrollment.find({
      where: { userNetid: user.netid },
    });
    // map the courses to a list of course ids
    const enrollmentCourseIds = _.map(enrollments, "courseId");

    // all enrollable courses
    const enrollableCourses = await this.find({
      where: {
        enrollable: true,
      },
      order: { id: "ASC" },
    });
    // remove courses based on inactive academic years and already enrolled courses
    _.remove(enrollableCourses, (o) => {
      return !o.academicYear?.active || _.includes(enrollmentCourseIds, o.id);
    });
    return enrollableCourses;
  }
}
