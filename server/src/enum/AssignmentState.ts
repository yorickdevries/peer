enum AssignmentState {
  UNPUBLISHED = "unpublished",
  SUBMISSION = "submission",
  WAITING_FOR_REVIEW = "waitingforreview",
  REVIEW = "review",
  FEEDBACK = "feedback",
}

const assignmentStateOrder = [
  AssignmentState.UNPUBLISHED,
  AssignmentState.SUBMISSION,
  AssignmentState.WAITING_FOR_REVIEW,
  AssignmentState.REVIEW,
  AssignmentState.FEEDBACK,
];

export { AssignmentState, assignmentStateOrder };
