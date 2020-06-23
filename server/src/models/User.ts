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

  @Column("int", { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  studentNumber?: number | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prefix?: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayName?: string | null;

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
    this.studentNumber = studentNumber;
    this.firstName = firstName;
    this.prefix = prefix;
    this.lastName = lastName;
    this.email = email;
    this.displayName = displayName;
    this.affiliation = affiliation;
    this.study = study;
    this.organisationUnit = organisationUnit;
  }
}
