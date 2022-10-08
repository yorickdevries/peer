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

  @Column()
  @IsDefined()
  @IsString()
  filePath: string;

  constructor(
    name: string,
    extension: string,
    hash: string | null,
    filePath?: string | null
  ) {
    super();
    this.name = name;
    this.extension = extension;
    if (hash === null) {
      // placeholder untill it's calculated
      // future: const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
      this.hash =
        "0000000000000000000000000000000000000000000000000000000000000000";
    } else {
      this.hash = hash;
    }
    if (filePath !== null && filePath !== undefined) {
      this.filePath = filePath;
    } else {
      this.filePath = "";
    }
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
    if (this.filePath.length === 0) {
      this.filePath = path.resolve(uploadFolder, this.id.toString());
    }
    return this.filePath;
  }
}
