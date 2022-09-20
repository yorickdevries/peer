import AssignmentVersion from "../../src/models/AssignmentVersion";
import Group from "../../src/models/Group";
import MultipleChoiceQuestion from "../../src/models/MultipleChoiceQuestion";
import Review from "../../src/models/Review";
import ReviewOfSubmission from "../../src/models/ReviewOfSubmission";
import Submission from "../../src/models/Submission";
import SubmissionQuestionnaire from "../../src/models/SubmissionQuestionnaire";
import User from "../../src/models/User";
import { mock, when, instance } from "ts-mockito";
import Assignment from "../../src/models/Assignment";
import AssignmentType from "../../src/enum/AssignmentType";
import PDFAnnotation from "../../src/models/PDFAnnotation";
import MultipleChoiceQuestionAnswer from "../../src/models/MultipleChoiceQuestionAnswer";
import MultipleChoiceQuestionOption from "../../src/models/MultipleChoiceQuestionOption";
import ReviewOfReview from "../../src/models/ReviewOfReview";
import parseSubmissionReviewsForExport from "../../src/util/parseReviewsForExport";
test("Single MCQ Question Correct", async () => {
  const mockedQuestionnaire: SubmissionQuestionnaire = mock(
    SubmissionQuestionnaire
  );
  const instanceOfQ = instance(mockedQuestionnaire)
  const m = new MultipleChoiceQuestion(
    "this is mcq",
    1,
    false,
    true,
    instanceOfQ
  );
  m.options = [
    new MultipleChoiceQuestionOption("correct", m, 100),
    new MultipleChoiceQuestionOption("wrong", m, 0),
  ];
  instanceOfQ.questions = [m];
  const g1: Group = mock(Group);
  const instanceOfG1 = instance(g1)
  instanceOfG1.id = 1;
  instanceOfG1.name = "g1";
  //submitter
  const instanceOfU1: User = new User("u1");

  //instanceOfU1.studentNumber = 1;
  //reviewer
  const instanceOfU2: User = new User("u2");
  //instanceOfU2.studentNumber = 2;
  const s1: Submission = mock(Submission);
  const instanceOfS1 = instance(s1)


  const r1: ReviewOfSubmission = mock(ReviewOfSubmission);
  const instanceOfR1 = instance(r1);

  instanceOfR1.submission = instanceOfS1;
  instanceOfR1.reviewer = instanceOfU2;
  instanceOfR1.id = 1;
  instanceOfR1.submitted = true;
  instanceOfR1.flaggedByReviewer = false;
  const ma = mock(MultipleChoiceQuestionAnswer);

  const answerOption = mock(MultipleChoiceQuestionOption);
  const instanceOfAnswerOption = instance(answerOption);
  instanceOfAnswerOption.text = "correct";
  instanceOfAnswerOption.question = m;
  instanceOfAnswerOption.points = 1;

  const instanceOfMa = instance(ma)
  instanceOfMa.question = m;
  instanceOfMa.review = instanceOfR1;
  instanceOfMa.multipleChoiceAnswer = instanceOfAnswerOption;
  // const ma = new MultipleChoiceQuestionAnswer(
  //   m,
  //   instanceOfR1,
  //   new MultipleChoiceQuestionOption("correct", m, 1)
  // );
  const a1: Assignment = mock(Assignment);
  const instanceOfA1: Assignment = instance(a1)

  //assignment is a pdf
  instanceOfA1.assignmentType = AssignmentType.DOCUMENT;
  
  const pdfA: PDFAnnotation = mock(PDFAnnotation);
  
  const reviewSubmissionList: Promise<Review[]> = new Promise<Review[]>(
    (resolve) => {
      const lst: ReviewOfSubmission[] = [instanceOfR1];
      resolve(lst);
    }
  );
  const aVersion = mock(AssignmentVersion);

  when(s1.getUser()).thenReturn(
    new Promise<User>((resolve) => {
      resolve(instanceOfU1);
    })
  );
  when(s1.getGroup()).thenReturn(
    new Promise<Group>((resolve) => {
      resolve(instanceOfG1);
    })
  );
  when(a1.getGroup(instanceOfU2)).thenReturn(
    new Promise<Group>((resolve) => {
      resolve(instanceOfG1);
    })
  );
  when(r1.getPDFAnnotations()).thenReturn(
    new Promise<PDFAnnotation[]>((resolve) => {
      resolve([instance(pdfA)]);
    })
  );
  when(r1.getAnswer(m)).thenReturn(
    new Promise<MultipleChoiceQuestionAnswer>((resolve) => {
      resolve(instanceOfMa);
    })
  );
  when(ma.getAnswerText()).thenReturn("answer");
  when(ma.getAnswerPoints()).thenReturn(new Promise<number | undefined>((resolve) => {resolve(100)}));
  when(r1.getReviewOfThisReview()).thenReturn(
    new Promise<ReviewOfReview | undefined>((reject) => {
      reject(undefined);
    })
  );
  when(aVersion.getAssignment()).thenReturn(
    new Promise<Assignment>((resolve) => {
      resolve(instanceOfA1);
    })
  );
  when(mockedQuestionnaire.getReviews()).thenReturn(reviewSubmissionList);
  when(mockedQuestionnaire.getAssignmentVersion()).thenReturn(
    new Promise<AssignmentVersion>((resolve) => {
      resolve(instance(aVersion));
    })
  );


  let exp =  new Promise<any[]>((resolve) => resolve(    [                                                                                                                                                                
    {
      id: 1,
      'Submitter netid': 'u1',
      'Submitter studentnumber': undefined,
      'Submitter group id': 1,
      'Submitter group name': 'g1',
      'Reviewer netid': 'u2',
      'Reviewer studentnumber': undefined,
      'Reviewer group id': 1,
      'Reviewer group name': 'g1',
      'Submissionreview started at': null,
      'Submissionreview downloaded at': null,
      'Submissionreview submitted at': null,
      'Submissionreview submitted': true,
      'Submissionreview approval by TA': null,
      'Submissionreview comment by TA': null,
      'Submissionreview TA netid': undefined,
      'Submissionreview Reviewer reported the submission': false,
      'number of annotations': 1,
      'R1. this is mcq': 'answer',
      'R1. this is mcq (POINTS)': 1,
      'Total number of points': 1,
      'Maximum points achievable': 1,
      'Evaluator netid': undefined,
      'Evaluator studentnumber': undefined,
      'Reviewevaluation started at': undefined,
      'Reviewevaluation downloaded at': undefined,
      'Reviewevaluation submitted at': undefined,
      'Reviewevaluation submitted': undefined,
      'Reviewevaluation approval by TA': undefined,
      'Reviewevaluation comment by TA': undefined,
      'Reviewevaluation TA netid': undefined,
      'Reviewevaluation Reviewer reported the submission': undefined
    }
  ]));
  expect(parseSubmissionReviewsForExport(instanceOfQ)).toEqual(exp);
});
