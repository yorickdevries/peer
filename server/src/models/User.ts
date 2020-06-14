import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  // Annotated with "!"" due to typescripts strictPropertyInitialization
  netid!: string;

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
  // is either string or string[], but now saved as string in the database
  affiliation?: string;

  @Column()
  displayName?: string;

  @Column()
  study?: string;

  @Column()
  // is either string or string[], but now saved as string in the database
  organisationUnit?: string;
}
