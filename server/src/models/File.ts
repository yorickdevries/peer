import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsDefined, IsHash, IsNotEmpty, IsString } from "class-validator";
import BaseModel from "./BaseModel";
import path from "path";
import config from "config";

const uploadFolder = config.get("uploadFolder") as string;

interface FileInterface {
  name: string;
  extension: string;
  hash: string | null;
}

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

  constructor(init?: FileInterface) {
    if (init !== undefined) {
      super();
      this.name = init.name;
      this.extension = init.extension;
      if (init.hash === null) {
        // placeholder untill it's calculated
        // future: const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
        this.hash =
          "0000000000000000000000000000000000000000000000000000000000000000";
      } else {
        this.hash = init.hash;
      }
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
    const filePath = path.resolve(uploadFolder, this.id.toString());
    return filePath;
  }
}
