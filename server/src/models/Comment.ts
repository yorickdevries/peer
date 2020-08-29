import { PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { IsString, IsNotEmpty, IsDefined } from "class-validator";
import BaseModel from "./BaseModel";
import User from "./User";

export default abstract class Comment extends BaseModel {
  @PrimaryGeneratedColumn()
  // id SERIAL,
  id!: number;

  // comment varchar(100000) NOT NULL,
  @Column("text")
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  // netid varchar(500) NOT NULL,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, {
    nullable: false,
  })
  user?: User;

  constructor(text: string, user: User) {
    super();
    this.text = text;
    this.user = user;
  }
}
