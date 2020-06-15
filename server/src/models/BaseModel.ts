import { BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

// Adds the basic fields of @CreateDateColumn and UpdateDateColumn
export abstract class BaseModel extends BaseEntity {
  @CreateDateColumn({ type: "timestamp" })
  // Added ! due to tsc complications
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  // Added ! due to tsc complications
  updatedAt!: Date;
}
