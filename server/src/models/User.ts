import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from "typeorm";
import {
  IsDefined,
  IsOptional,
  IsString,
  IsInt,
  IsAlphanumeric,
  IsLowercase,
  IsPositive,
  IsEmail,
  IsNotEmpty,
} from "class-validator";
import BaseModel from "./BaseModel";
import Affiliation from "./Affiliation";
import Study from "./Study";
import OrganisationUnit from "./OrganisationUnit";

@Entity()
export default class User extends BaseModel {
  @PrimaryColumn()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @IsLowercase()
  netid: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  studentNumber?: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prefix?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayName?: string;

  @ManyToMany((_type) => Affiliation)
  @JoinTable()
  affiliation?: Affiliation[];

  @ManyToMany((_type) => Study)
  @JoinTable()
  study?: Study[];

  @ManyToMany((_type) => OrganisationUnit)
  @JoinTable()
  organisationUnit?: OrganisationUnit[];

  constructor(
    netid: string,
    studentNumber?: number | null,
    firstName?: string | null,
    prefix?: string | null,
    lastName?: string | null,
    email?: string | null,
    displayName?: string | null,
    affiliation?: Affiliation[],
    study?: Study[],
    organisationUnit?: OrganisationUnit[]
  ) {
    super();
    this.netid = netid;
    // the cast is done so the fields can be set to null in the database
    this.studentNumber = studentNumber as number | undefined;
    this.firstName = firstName as string | undefined;
    this.prefix = prefix as string | undefined;
    this.lastName = lastName as string | undefined;
    this.email = email as string | undefined;
    this.displayName = displayName as string | undefined;
    this.affiliation = affiliation;
    this.study = study;
    this.organisationUnit = organisationUnit;
  }
}
