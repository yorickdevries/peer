import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import BaseModel from "./BaseModel";

@Entity()
export default class Preferences extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("boolean", { default: true })
  stRemStageNotSubmitted!: boolean;

  @Column("boolean", { default: true })
  stRemLateSubmission!: boolean;

  constructor() {
    super();
  }
}
