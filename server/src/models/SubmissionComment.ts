import { Entity, ManyToOne } from "typeorm";
import Submission from "./Submission";
import User from "./User";
import Comment from "./Comment";

@Entity()
export default class SubmissionComment extends Comment {
  @ManyToOne((_type) => Submission, {
    nullable: false,
  })
  submission?: Submission;

  constructor(text: string, user: User, submission: Submission) {
    super(text, user);
    this.submission = submission;
  }
}
