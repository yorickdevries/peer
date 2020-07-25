// the different states an assignment can be in
enum AssignmentState {
  UNPUBLISHED = "unpublished",
  SUBMISSION = "submission",
  WAITING_FOR_REVIEW = "waitingforreview",
  REVIEW = "review",
  FEEDBACK = "feedback",
}

// the chronological order of the states
const assignmentStateOrder = [
  AssignmentState.UNPUBLISHED,
  AssignmentState.SUBMISSION,
  AssignmentState.WAITING_FOR_REVIEW,
  AssignmentState.REVIEW,
  AssignmentState.FEEDBACK,
];

export { AssignmentState, assignmentStateOrder };
