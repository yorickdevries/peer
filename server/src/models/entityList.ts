// All Database models
import User from "./User";
import Affiliation from "./Affiliation";
import Study from "./Study";
import OrganisationUnit from "./OrganisationUnit";
import Faculty from "./Faculty";
import AcademicYear from "./AcademicYear";
import Course from "./Course";
import Enrollment from "./Enrollment";
import Assignment from "./Assignment";
import AssignmentVersion from "./AssignmentVersion";
import File from "./File";
import Group from "./Group";
import Submission from "./Submission";
import Questionnaire from "./Questionnaire";
import SubmissionQuestionnaire from "./SubmissionQuestionnaire";
import ReviewQuestionnaire from "./ReviewQuestionnaire";
import Question from "./Question";
import CheckboxQuestion from "./CheckboxQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import OpenQuestion from "./OpenQuestion";
import RangeQuestion from "./RangeQuestion";
import UploadQuestion from "./UploadQuestion";
import QuestionOption from "./QuestionOption";
import CheckboxQuestionOption from "./CheckboxQuestionOption";
import MultipleChoiceQuestionOption from "./MultipleChoiceQuestionOption";
import Review from "./Review";
import ReviewOfSubmission from "./ReviewOfSubmission";
import ReviewOfReview from "./ReviewOfReview";
import QuestionAnswer from "./QuestionAnswer";
import CheckboxQuestionAnswer from "./CheckboxQuestionAnswer";
import MultipleChoiceQuestionAnswer from "./MultipleChoiceQuestionAnswer";
import OpenQuestionAnswer from "./OpenQuestionAnswer";
import RangeQuestionAnswer from "./RangeQuestionAnswer";
import UploadQuestionAnswer from "./UploadQuestionAnswer";
import PDFAnnotation from "./PDFAnnotation";
import CommentingPDFAnnotation from "./CommentingPDFAnnotation";
import ReplyingPDFAnnotation from "./ReplyingPDFAnnotation";
import AssignmentExport from "./AssignmentExport";
import CodeAnnotation from "./CodeAnnotation";
import Banner from "./Banner";
import Preferences from "./Preferences";
// End of All Database models

const entityList = [
  User,
  Affiliation,
  Study,
  OrganisationUnit,
  Faculty,
  AcademicYear,
  AssignmentVersion,
  Course,
  Enrollment,
  Assignment,
  File,
  Group,
  Submission,
  Questionnaire,
  SubmissionQuestionnaire,
  ReviewQuestionnaire,
  Question,
  CheckboxQuestion,
  MultipleChoiceQuestion,
  OpenQuestion,
  RangeQuestion,
  UploadQuestion,
  QuestionOption,
  CheckboxQuestionOption,
  MultipleChoiceQuestionOption,
  Review,
  ReviewOfSubmission,
  ReviewOfReview,
  QuestionAnswer,
  CheckboxQuestionAnswer,
  MultipleChoiceQuestionAnswer,
  OpenQuestionAnswer,
  RangeQuestionAnswer,
  UploadQuestionAnswer,
  PDFAnnotation,
  CommentingPDFAnnotation,
  ReplyingPDFAnnotation,
  AssignmentExport,
  CodeAnnotation,
  Banner,
  Preferences,
];

export default entityList;
