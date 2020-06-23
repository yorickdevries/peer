import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
} from "typeorm";
import {
  IsDefined,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsBoolean,
} from "class-validator";
import BaseModel from "./BaseModel";
import Faculty from "./Faculty";
import AcademicYear from "./AcademicYear";

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

  @ManyToOne((_type) => Faculty)
  @JoinTable()
  faculty?: Faculty;

  @ManyToOne((_type) => AcademicYear)
  @JoinTable()
  academicYear?: AcademicYear;

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
}
