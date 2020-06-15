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
import { BaseModel } from "./BaseModel";
import { Affiliation } from "./Affiliation";
import { Study } from "./Study";
import { OrganisationUnit } from "./OrganisationUnit";

@Entity()
export class User extends BaseModel {
  @PrimaryColumn()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @IsLowercase()
  private netid: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  private studentNumber?: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  private firstName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  private prefix?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  private lastName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  private email?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  private displayName?: string;

  @ManyToMany((_type) => Affiliation)
  @JoinTable()
  private affiliation?: Affiliation[];

  @ManyToMany((_type) => Study)
  @JoinTable()
  private study?: Study[];

  @ManyToMany((_type) => OrganisationUnit)
  @JoinTable()
  private organisationUnit?: OrganisationUnit[];

  constructor(
    netid: string,
    studentNumber?: number,
    firstName?: string,
    prefix?: string,
    lastName?: string,
    email?: string,
    displayName?: string,
    affiliation?: Affiliation[],
    study?: Study[],
    organisationUnit?: OrganisationUnit[]
  ) {
    super();
    this.netid = netid;
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

  // temporarily added as typescript doesn't compile when private fields aren't used
  toString(): string {
    return `${this.netid},${this.studentNumber},${this.firstName},${this.prefix}, ${this.lastName},${this.email},${this.affiliation},${this.displayName},${this.study},${this.organisationUnit}`;
  }
}
