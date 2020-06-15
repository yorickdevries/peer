import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

// Adds the basic fields of @CreateDateColumn and UpdateDateColumn
export abstract class BaseModel extends BaseEntity {
  @CreateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    process.env.NODE_ENV === "test" ? undefined : { type: "timestamp" }
  )
  // Added ! due to tsc complications
  createdAt!: Date;

  @UpdateDateColumn(
    // set datatype to timestamp if not running in test environment
    // maybe move to separate function when more Dates are used in the database
    process.env.NODE_ENV === "test" ? undefined : { type: "timestamp" }
  )
  // Added ! due to tsc complications
  updatedAt!: Date;
}
