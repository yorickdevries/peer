import { ChildEntity, OneToOne, JoinColumn } from "typeorm";
import QuestionAnswerType from "../enum/QuestionAnswerType";
import QuestionAnswer from "./QuestionAnswer";
import Review from "./Review";
import { IsDefined } from "class-validator";
import UploadQuestion from "./UploadQuestion";
import File from "./File";

@ChildEntity(QuestionAnswerType.UPLOAD)
export default class UploadQuestionAnswer extends QuestionAnswer {
  // file_path varchar(500) NOT NULL,
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  @IsDefined()
  uploadAnswer: File;

  constructor(question: UploadQuestion, review: Review, answer: File) {
    super(question, review);
    this.uploadAnswer = answer;
  }
}
