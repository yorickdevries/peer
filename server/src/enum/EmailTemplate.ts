enum EmailTemplate {
  NO_SUBMISSION_YET = "no_submission_yet",
  NO_REVIEW_YET = "no_review_yet",
  NO_EVALUATION_YET = "no_evaluation_yet",
}

const templates = {
  no_submission_yet: (
    studentName: string,
    courseCode: string,
    assignmentName: string,
    dueDate: string
  ) => {
    return {
      subject: `Missing submission in course: '${courseCode}'`,
      text: `${studentName},
      
      Your group has not submitted anything for assignment: '${assignmentName}'
      
      Please make sure to submit something before the due date: '${dueDate}'
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer`,
    };
  },
  no_review_yet: (
    studentName: string,
    courseCode: string,
    assignmentName: string,
    dueDate: string
  ) => {
    return {
      subject: `Missing review(s) in course: '${courseCode}'`,
      text: `${studentName},
      
      Review(s) have still not been completed for assignment: '${assignmentName}'
      
      Please make sure to submit all reviews before the review due date: '${dueDate}'
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer`,
    };
  },
  no_evaluation_yet: (
    studentName: string,
    courseCode: string,
    assignmentName: string,
    dueDate: string
  ) => {
    return {
      subject: `Missing evaluation(s) in course: '${courseCode}'`,
      text: `${studentName},
      
      Evaluation(s) have still not been completed for assignment: '${assignmentName}'
      
      Please make sure to evaluate all received reviews before the evaluation due date: '${dueDate}'
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer`,
    };
  },
};

export { EmailTemplate, templates };
