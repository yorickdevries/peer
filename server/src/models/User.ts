import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { OrganisationUnit } from "./OrganisationUnit";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  private netid: string;

  @Column({ nullable: true })
  private studentNumber?: number;

  @Column({ nullable: true })
  private firstName?: string;

  @Column({ nullable: true })
  private prefix?: string;

  @Column({ nullable: true })
  private lastName?: string;

  @Column({ nullable: true })
  private email?: string;

  @Column({ nullable: true })
  // is either string or string[], but now saved as string in the database
  private affiliation?: string;

  @Column({ nullable: true })
  private displayName?: string;

  @Column({ nullable: true })
  private study?: string;

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
    affiliation?: string,
    displayName?: string,
    study?: string,
    organisationUnit?: OrganisationUnit[]
  ) {
    super();
    this.netid = netid;
    this.studentNumber = studentNumber;
    this.firstName = firstName;
    this.prefix = prefix;
    this.lastName = lastName;
    this.email = email;
    this.affiliation = affiliation;
    this.displayName = displayName;
    this.study = study;
    this.organisationUnit = organisationUnit;
  }

  // temporatily added as typescipt doesn't compile when private fields aren't used
  toString(): string {
    return `${this.netid},${this.studentNumber},${this.firstName},${this.prefix}, ${this.lastName},${this.email},${this.affiliation},${this.displayName},${this.study},${this.organisationUnit}`;
  }
}
