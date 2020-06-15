import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { validate, ValidationError, IsDate } from "class-validator";

// Adds the basic fields of @CreateDateColumn and UpdateDateColumn
export abstract class BaseModel extends BaseEntity {
  @CreateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    process.env.NODE_ENV === "test" ? undefined : { type: "timestamp" }
  )
  @IsDate()
  // Added ! due to tsc complications
  createdAt!: Date;

  @UpdateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    process.env.NODE_ENV === "test" ? undefined : { type: "timestamp" }
  )
  @IsDate()
  // Added ! due to tsc complications
  updatedAt!: Date;

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
}
