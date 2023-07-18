import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from "typeorm";
import {
  IsAlphanumeric,
  IsDefined,
  IsEmail,
  IsInt,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import BaseModel from "./BaseModel";
import Affiliation from "./Affiliation";
import Study from "./Study";
import OrganisationUnit from "./OrganisationUnit";
import parseNetID from "../util/parseNetID";
import Group from "./Group";
import Preferences from "./Preferences";

interface UserInterface {
  netid: string;
  affiliation?: Affiliation[];
  study?: Study[];
  organisationUnit?: OrganisationUnit[];
  studentNumber?: number | null;
  firstName?: string | null;
  prefix?: string | null;
  lastName?: string | null;
  email?: string | null;
  displayName?: string | null;
}

@Entity()
export default class User extends BaseModel {
  // length of max 191 due to UTF-8MB4 encoding of strings
  // see also: https://github.com/gogs/gogs/issues/4894#issuecomment-348861978
  @PrimaryColumn({ length: 63 })
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
  studentNumber: number | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prefix: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string | null;

  @Column("varchar", { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  displayName: string | null;

  @Column("boolean", { default: false })
  admin!: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => Affiliation, {
    eager: true,
  })
  @JoinTable()
  affiliation: Affiliation[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => Study, {
    eager: true,
  })
  @JoinTable()
  study: Study[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => OrganisationUnit, {
    eager: true,
  })
  @JoinTable()
  organisationUnit: OrganisationUnit[];

  // User groups
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToMany((_type) => Group, (group) => group.users)
  groups?: Group[];

  @OneToOne(() => Preferences, (preferences) => preferences.user, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  preferences!: Preferences;

  constructor(init?: UserInterface) {
    if (init !== undefined) {
      super();
      this.netid = init.netid;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.studentNumber = init.studentNumber!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.firstName = init.firstName!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.prefix = init.prefix!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.lastName = init.lastName!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.email = init.email!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.displayName = init.displayName!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.affiliation = init.affiliation!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.study = init.study!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.organisationUnit = init.organisationUnit!;
    }
  }

  async validateOrReject(): Promise<void> {
    // validate the netid
    if (this.netid !== parseNetID(this.netid)) {
      throw new Error(`invalid netid: ${this.netid}`);
    }
    return super.validateOrReject();
  }
}
