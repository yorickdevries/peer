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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((_type) => File, { eager: true })
  @JoinColumn()
  @IsDefined()
  uploadAnswer: File;

  constructor(question: UploadQuestion, review: Review, answer: File) {
    super(question, review);
    this.uploadAnswer = answer;
  }

  // validation: file should have the right extension
  async validateOrReject(): Promise<void> {
    const question = await this.getQuestion();
    // check if the file has the right extension
    if (!question.extensions.split(",").includes(this.uploadAnswer.extension)) {
      throw new Error("The file is of the wrong extension");
    }
    // all succeeds the super validateOrReject can be called
    return super.validateOrReject();
  }

  async getQuestion(): Promise<UploadQuestion> {
    const questionId = this.question ? this.question.id : this.questionId;
    return UploadQuestion.findOneOrFail(questionId);
  }

  getAnswerText(): string {
    return this.uploadAnswer.getFileNamewithExtension();
  }
}
