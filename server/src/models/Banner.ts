import { Column, Entity, Not, PrimaryGeneratedColumn } from "typeorm";
import { IsBoolean, IsDefined, IsNotEmpty, IsString } from "class-validator";
import BaseModel from "./BaseModel";

interface AnonymousBanner {
  title: string;
  text: string;
}

interface BannerInterface {
  title: string;
  text: string;
  active: boolean;
}

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

  init(init: BannerInterface) {
    this.title = init.title;
    this.text = init.text;
    this.active = init.active;
    return this;
  }

  async validateOrReject(): Promise<void> {
    if (this.active) {
      const params = {
        active: true,
      };
      if (this.id) {
        Object.defineProperty(params, "id", {
          value: Not(this.id),
        });
      }
      const otherBanners = await Banner.find({
        where: params,
      });

      if (otherBanners.length > 0) {
        throw new Error("There can only be one active banner at a time.");
      }
    }
  }

  getAnonymousBanner(): AnonymousBanner {
    return {
      title: this.title,
      text: this.text,
    };
  }
}
