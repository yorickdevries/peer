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
  // Annotated with "!" due to typescripts strictPropertyInitialization
  netid!: string;

  @Column({ nullable: true })
  studentNumber?: number;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  prefix?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  // is either string or string[], but now saved as string in the database
  affiliation?: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  study?: string;

  @ManyToMany((_type) => OrganisationUnit)
  @JoinTable()
  organisationUnit?: OrganisationUnit[];
}
