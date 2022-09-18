import AssignmentVersion from "../../src/models/AssignmentVersion";
import Group from "../../src/models/Group";
import MultipleChoiceQuestion from "../../src/models/MultipleChoiceQuestion";
import Review from "../../src/models/Review";
import ReviewOfSubmission from "../../src/models/ReviewOfSubmission";
import Submission from "../../src/models/Submission";
import SubmissionQuestionnaire from "../../src/models/SubmissionQuestionnaire";
import User from "../../src/models/User";
import { mock, when } from "ts-mockito";
import Assignment from "../../src/models/Assignment";
import AssignmentType from "../../src/enum/AssignmentType";
import PDFAnnotation from "../../src/models/PDFAnnotation";
import MultipleChoiceQuestionAnswer from "../../src/models/MultipleChoiceQuestionAnswer";
import MultipleChoiceQuestionOption from "../../src/models/MultipleChoiceQuestionOption";
import ReviewOfReview from "../../src/models/ReviewOfReview";
import parseSubmissionReviewsForExport from "../../src/util/parseReviewsForExport";

describe("Single MCQ Question", () => {
  const mockedQuestionnaire: SubmissionQuestionnaire = mock(
    SubmissionQuestionnaire
  );
  const m = new MultipleChoiceQuestion(
    "this is mcq",
    1,
    false,
    true,
    mockedQuestionnaire
  );
  m.options = [
    new MultipleChoiceQuestionOption("correct", m, 1),
    new MultipleChoiceQuestionOption("wrong", m, 0),
  ];
  mockedQuestionnaire.questions = [m];
  const g1: Group = mock(Group);
  g1.id = 1;
  g1.name = "g1";
  //submitter
  const u1: User = new User("u1");
  u1.studentNumber = 1;
  //reviewer
  const u2: User = new User("u2");
  u2.studentNumber = 2;
  const s1: Submission = mock(Submission);

  when(s1.getUser()).thenReturn(
    new Promise<User>((resolve) => {
      resolve(u1);
    })
  );
  when(s1.getGroup()).thenReturn(
    new Promise<Group>((resolve) => {
      resolve(g1);
    })
  );

  const r1: ReviewOfSubmission = mock(ReviewOfSubmission);
  const ma = new MultipleChoiceQuestionAnswer(
    m,
    r1,
    new MultipleChoiceQuestionOption("correct", m, 1)
  );
  const a1: Assignment = mock(Assignment);
  when(a1.getGroup(u2)).thenReturn(
    new Promise<Group>((resolve) => {
      resolve(g1);
    })
  );
  //assignment is a pdf
  a1.assignmentType = AssignmentType.DOCUMENT;
  r1.submission = s1;
  r1.reviewer = u2;
  r1.id = 1;
  r1.submitted = true;
  r1.flaggedByReviewer = false;
  const pdfA: PDFAnnotation = mock(PDFAnnotation);
  when(r1.getPDFAnnotations()).thenReturn(
    new Promise<PDFAnnotation[]>((resolve) => {
      resolve([pdfA]);
    })
  );
  const reviewSubmissionList: Promise<Review[]> = new Promise<Review[]>(
    (resolve) => {
      const lst: ReviewOfSubmission[] = [r1];
      resolve(lst);
    }
  );
  const aVersion = mock(AssignmentVersion);
  when(r1.getAnswer(m)).thenReturn(
    new Promise<MultipleChoiceQuestionAnswer>((resolve) => {
      resolve(ma);
    })
  );
  when(r1.getReviewOfThisReview()).thenReturn(
    new Promise<ReviewOfReview | undefined>((reject) => {
      reject(undefined);
    })
  );
  when(aVersion.getAssignment()).thenReturn(
    new Promise<Assignment>((resolve) => {
      resolve(a1);
    })
  );
  when(mockedQuestionnaire.getReviews()).thenReturn(reviewSubmissionList);
  when(mockedQuestionnaire.getAssignmentVersion()).thenReturn(
    new Promise<AssignmentVersion>((resolve) => {
      resolve(aVersion);
    })
  );
  expect(parseSubmissionReviewsForExport(mockedQuestionnaire)).toBe("normalnetid");
});
