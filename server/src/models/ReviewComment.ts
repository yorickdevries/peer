import { Entity, ManyToOne } from "typeorm";
import Review from "./Review";
import User from "./User";
import Comment from "./Comment";

@Entity()
export default class ReviewComment extends Comment {
  @ManyToOne((_type) => Review, {
    nullable: false,
  })
  review?: Review;

  constructor(text: string, user: User, review: Review) {
    super(text, user);
    this.review = review;
  }
}
