import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import BaseModel from "./BaseModel";
import User from "./User";

@Entity()
export default class Preferences extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.preferences)
  user?: User;

  @Column("boolean", { default: true })
  stRemStageNotSubmitted!: boolean;

  @Column("boolean", { default: true })
  stRemLateSubmission!: boolean;
}
