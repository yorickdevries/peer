import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  SaveOptions,
} from "typeorm";
import {
  validate,
  validateOrReject,
  ValidationError,
  IsDate,
  IsOptional,
} from "class-validator";

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
  createdAt?: Date;

  @UpdateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    { type: process.env.NODE_ENV === "test" ? undefined : "timestamp" }
  )
  // these fields are created after saving, so @IsOptional() is added
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  // validation route which can be externally called and can return error objects
  validate(): Promise<ValidationError[] | undefined> {
    return validate(this).then((errors) => {
      if (errors.length > 0) {
        return errors;
      } else {
        return undefined;
      }
    });
  }

  // validateOrReject to be run before saving/updating by TypeORM
  @BeforeInsert()
  @BeforeUpdate()
  validateOrReject(): Promise<void> {
    return validateOrReject(this);
  }

  // reloads the entry after saving to the database
  async save(options?: SaveOptions): Promise<this> {
    await super.save(options);
    await this.reload();
    return this;
  }
}
