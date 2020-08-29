enum ResponseMessage {
  NOT_FOUND = "Resource not found",
  INTERNAL_SERVER_ERROR = "Internal server error, please contact the system administrator",
  NO_EMPLOYEE = "You are not an employee",
  NOT_ENROLLED_IN_COURSE = "You are not enrolled in this course",
  NOT_TEACHER_IN_COURSE = "You are not a teacher in this course",
  NOT_TEACHER_OR_TEACHING_ASSISTANT_IN_COURSE = "You are not a teacher or teaching assistant in this course",
  USER_NOT_FOUND = "The specified user is not found",
  COURSE_NOT_FOUND = "The specified course is not found",
  ASSIGNMENT_NOT_FOUND = "The specified assignment is not found",
  GROUP_NOT_FOUND = "The specified group is not found",
  QUESTIONNAIRE_NOT_FOUND = "The specified questionnaire is not found",
  QUESTION_NOT_FOUND = "The specified question is not found",
  QUESTIONOPTION_NOT_FOUND = "The specified questionoption is not found",
  QUESTIONANSWER_NOT_FOUND = "The specified questionanswer is not found",
  REVIEW_NOT_FOUND = "The specified review is not found",
  SUBMISSION_NOT_FOUND = "The specified submission is not found",
  ANSWER_NOT_FOUND = "The specified answer is not found",
}

export default ResponseMessage;
