import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity()
export class UserModel {
  @PrimaryColumn()
  netid: string;

  @Column()
  studentNumber?: number;

  @Column()
  firstName?: string;

  @Column()
  prefix?: string;

  @Column()
  lastName?: string;

  @Column()
  email?: string;

  @Column()
  affiliation?: string | string[];

  @Column()
  displayName?: string;

  @Column()
  study?: string;

  @Column()
  organisationUnit?: string | string[];
}
