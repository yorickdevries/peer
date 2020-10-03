import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  SaveOptions,
} from "typeorm";
import { validateOrReject, IsDate, IsOptional } from "class-validator";

// Adds the basic fields of @CreateDateColumn and UpdateDateColumn
export default abstract class BaseModel extends BaseEntity {
  @CreateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    { type: process.env.NODE_ENV === "test" ? undefined : "timestamp" }
  )
  // these fields are created after saving, so @IsOptional() is added
  @IsOptional()
  @IsDate()
  createdAt!: Date;

  @UpdateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    { type: process.env.NODE_ENV === "test" ? undefined : "timestamp" }
  )
  // these fields are created after saving, so @IsOptional() is added
  @IsOptional()
  @IsDate()
  updatedAt!: Date;

  // basic super constructor
  constructor() {
    super();
  }

  // validateOrReject to be run before saving/updating by TypeORM
  // @BeforeInsert and @BeforeUpdate have a bug and lock up the database connection
  // see also: https://github.com/typeorm/typeorm/issues/6779
  // @BeforeInsert()
  // @BeforeUpdate()
  validateOrReject(): Promise<void> {
    return validateOrReject(this);
  }

  // reloads the entry after saving to the database
  async save(options?: SaveOptions): Promise<this> {
    // run validateOrReject here as it blocks when run with @BeforeInsert and @BeforeUpdate
    await this.validateOrReject();
    await super.save(options);
    await this.reload();
    return this;
  }
}
