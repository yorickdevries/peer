import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Affiliation } from "./Affiliation";
import { Study } from "./Study";
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

  // temporatily added as typescipt doesn't compile when private fields aren't used
  toString(): string {
    return `${this.netid},${this.studentNumber},${this.firstName},${this.prefix}, ${this.lastName},${this.email},${this.affiliation},${this.displayName},${this.study},${this.organisationUnit}`;
  }
}
