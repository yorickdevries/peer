import Joi from "@hapi/joi";
import HttpStatusCode from "../enum/HttpStatusCode";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";
import MultipleChoiceQuestionOption from "../models/MultipleChoiceQuestionOption";
import CheckboxQuestion from "../models/CheckboxQuestion";
import CheckboxQuestionOption from "../models/CheckboxQuestionOption";
import ResponseMessage from "../enum/ResponseMessage";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { AssignmentState } from "../enum/AssignmentState";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";

interface ReturnBody {
  status: number;
  ok: boolean;
  content: string | MultipleChoiceQuestionOption | CheckboxQuestion;
}

interface QuestionOption {
  isMultipleChoice: boolean;
  user: Express.User;
  text: string;
  id: number;
  points?: number;
}

// post a questionoption
const postQuestionHandler = async (
  option: QuestionOption
): Promise<ReturnBody> => {
  const { points, id, user, text, isMultipleChoice } = option;
  const question = isMultipleChoice
    ? await MultipleChoiceQuestion.findOne(id)
    : await CheckboxQuestion.findOne(id);
  if (!question) {
    return {
      status: HttpStatusCode.BAD_REQUEST,
      ok: false,
      content: ResponseMessage.QUESTION_NOT_FOUND,
    };
  }
  if (!(await question.isTeacherInCourse(user))) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: ResponseMessage.NOT_TEACHER_IN_COURSE,
    };
  }
  if (question.graded && points === undefined) {
    return {
      status: HttpStatusCode.BAD_REQUEST,
      ok: false,
      content: ResponseMessage.NON_GRADED_OPTION_FOR_QUESTION_GRADED,
    };
  }
  if (!question.graded && points !== undefined) {
    return {
      status: HttpStatusCode.BAD_REQUEST,
      ok: false,
      content: ResponseMessage.GRADED_OPTION_FOR_NON_QUESTION_GRADED,
    };
  }
  const questionnaire = await question.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: "The assignment is already in review state",
    };
  }
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.FEEDBACK)
  ) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: "The assignment is already in feedback state",
    };
  }
  const fomrattedPoints =
    points === undefined || points === null ? null : Number(points);
  const questionOption = isMultipleChoice
    ? new MultipleChoiceQuestionOption(text, question, fomrattedPoints)
    : new CheckboxQuestionOption(text, question, fomrattedPoints);
  return { status: 200, ok: true, content: questionOption };
};

// Joi inputvalidation
const questionPatchSchema = Joi.object({
  text: Joi.string().required(),
  points: Joi.number(),
});

const patchQuestionHandler = async (
  option: QuestionOption
): Promise<ReturnBody> => {
  const { points, id, user, text, isMultipleChoice } = option;
  const questionOption = isMultipleChoice
    ? await MultipleChoiceQuestionOption.findOne(id)
    : await CheckboxQuestionOption.findOne(id);
  if (!questionOption) {
    return {
      status: HttpStatusCode.BAD_REQUEST,
      ok: false,
      content: ResponseMessage.QUESTIONOPTION_NOT_FOUND,
    };
  }
  const question = await questionOption.getQuestion();
  if (!(await question.isTeacherInCourse(user))) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: ResponseMessage.NOT_TEACHER_IN_COURSE,
    };
  }
  const questionnaire = await question.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: "The assignment is already in review state",
    };
  }
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.FEEDBACK)
  ) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: "The assignment is already in feedback state",
    };
  }
  questionOption.text = text;
  const convertedNumber = Number(points);
  if (convertedNumber || convertedNumber === 0) {
    questionOption.points = convertedNumber;
  }
  return {
    status: 200,
    ok: true,
    content: questionOption,
  };
};

const deleteQuestionHandler = async (
  id: number,
  isMultipleChoice: boolean,
  user: Express.User
): Promise<ReturnBody> => {
  const questionOption = isMultipleChoice
    ? await MultipleChoiceQuestionOption.findOne(id)
    : await CheckboxQuestionOption.findOne(id);
  if (!questionOption) {
    return {
      status: HttpStatusCode.BAD_REQUEST,
      ok: false,
      content: ResponseMessage.QUESTIONOPTION_NOT_FOUND,
    };
  }
  const question = await questionOption.getQuestion();
  if (!(await question.isTeacherInCourse(user))) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: ResponseMessage.NOT_TEACHER_IN_COURSE,
    };
  }
  const questionnaire = await question.getQuestionnaire();
  const assignmentVersion = await questionnaire.getAssignmentVersion();
  const assignment = await assignmentVersion.getAssignment();
  if (
    questionnaire instanceof SubmissionQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.REVIEW)
  ) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: "The assignment is already in review state",
    };
  }
  if (
    questionnaire instanceof ReviewQuestionnaire &&
    assignment.isAtOrAfterState(AssignmentState.FEEDBACK)
  ) {
    return {
      status: HttpStatusCode.FORBIDDEN,
      ok: false,
      content: "The assignment is already in feedback state",
    };
  }
  return {
    status: 200,
    ok: true,
    content: questionOption,
  };
};
export default {
  postQuestionHandler,
  questionPatchSchema,
  patchQuestionHandler,
  deleteQuestionHandler,
};
