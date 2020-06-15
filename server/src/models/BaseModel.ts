import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { validate, ValidationError, IsDate, IsOptional } from "class-validator";

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

  // overloading save route
  save(): Promise<this> {
    // Class Validation before saving to database
    return this.validate().then((errors) => {
      if (errors) {
        throw errors;
      } else {
        return super.save();
      }
    });
  }

  // add validation route
  validate(): Promise<ValidationError[] | undefined> {
    return validate(this).then((errors) => {
      if (errors.length > 0) {
        return errors;
      } else {
        return undefined;
      }
    });
  }

  // temporarily added as typescript doesn't compile when private fields aren't used
  toString(): string {
    return `${this.createdAt},${this.updatedAt}`;
  }
}
