import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsDefined, IsString, IsNotEmpty, IsHash } from "class-validator";
import BaseModel from "./BaseModel";
import path from "path";
import config from "config";

const uploadFolder = config.get("uploadFolder") as string;

@Entity()
export default class File extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  extension: string;

  @Column()
  @IsDefined()
  @IsHash("sha256")
  @IsString()
  @IsNotEmpty()
  hash: string;

  constructor(name: string, extension: string, hash: string) {
    super();
    this.name = name;
    this.extension = extension;
    this.hash = hash;
  }

  getFileNamewithExtension(): string {
    return this.name + this.extension;
  }

  getAnonymousFileName(): string {
    return `File-${this.id}`;
  }

  getAnonymousFileNamewithExtension(): string {
    return `${this.getAnonymousFileName()}${this.extension}`;
  }

  getPath(): string {
    const filePath = path.resolve(uploadFolder, this.id.toString());
    return filePath;
  }
}
