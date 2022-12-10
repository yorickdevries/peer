import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { IsDefined, IsBoolean, IsString, IsNotEmpty } from "class-validator";
import BaseModel from "./BaseModel";

@Entity()
export default class Banner extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  text: string;

  @Column()
  @IsDefined()
  @IsBoolean()
  active: boolean;

  constructor(title: string, text: string, active: boolean) {
    super();
    this.title = title;
    this.text = text;
    this.active = active;
  }

  async validateOrReject(): Promise<void> {
    throw new Error("invalid");
  }
}
