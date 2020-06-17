import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import {
  validate,
  validateOrReject,
  ValidationError,
  IsDate,
  IsOptional,
} from "class-validator";

// Adds the basic fields of @CreateDateColumn and UpdateDateColumn
export abstract class BaseModel extends BaseEntity {
  @CreateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    process.env.NODE_ENV === "test" ? undefined : { type: "timestamp" }
  )
  // these fields are created after saving, so @IsOptional() is added
  @IsOptional()
  @IsDate()
  private createdAt?: Date;

  @UpdateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    process.env.NODE_ENV === "test" ? undefined : { type: "timestamp" }
  )
  // these fields are created after saving, so @IsOptional() is added
  @IsOptional()
  @IsDate()
  private updatedAt?: Date;

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
  private validateOrReject(): Promise<void> {
    return validateOrReject(this);
  }

  // temporarily added as typescript doesn't compile when private fields aren't used
  toString(): string {
    return `${this.createdAt},${this.updatedAt},${this.validateOrReject}`;
  }
}
