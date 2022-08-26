import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
  OneToOne,
  JoinColumn,
} from "typeorm";
import BaseModel from "./BaseModel";
import User from "./User";
import Assignment from "./Assignment";
import File from "./File";

@Entity()
export default class AssignmentExport extends BaseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  // User who triggered the export
  @RelationId((assignmentExport: AssignmentExport) => assignmentExport.user)
  userNetid!: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, { nullable: false })
  user?: User;

  // User who triggered the export
  @RelationId(
    (assignmentExport: AssignmentExport) => assignmentExport.assignment
  )
  assignmentId!: number;
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_type) => Assignment,
    (assignment) => assignment.assignmentExports,
    { nullable: false }
  )
  assignment?: Assignment;

  // File which is exported (can be null while exporting)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  file: File | null;

  constructor(user: User, assignment: Assignment, file: File | null) {
    super();
    this.user = user;
    this.assignment = assignment;
    this.file = file;
  }

  async getAssignment(): Promise<Assignment> {
    return Assignment.findOneOrFail(this.assignmentId);
  }

  getFile(): File | null {
    return this.file;
  }
}
