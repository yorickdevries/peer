enum EmailTemplate {
  NO_SUBMISSION_YET = "no_submission_yet",
  NO_REVIEW_YET = "no_review_yet",
  NO_EVALUATION_YET = "no_evaluation_yet",
  LATE_REVIEW_SUBMISSION = "late_review_submission",
  LATE_EVALUATION_SUBMISSION = "late_evaluation_submission",
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
  late_review_submission: (
    studentName: string,
    courseCode: string,
    assignmentName: string
  ) => {
    return {
      subject: `Late review submitted in course: '${courseCode}'`,
      text: `${studentName},
      
      A review was submitted for the assignment: '${assignmentName}'
      
      This review was submitted after the deadline, and we wanted to make sure you didn't miss it
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer`,
    };
  },
  late_evaluation_submission: (
    studentName: string,
    courseCode: string,
    assignmentName: string
  ) => {
    return {
      subject: `Late review evaluation submitted in course: '${courseCode}'`,
      text: `${studentName},
      
      A evaluation for a review you made was submitted for the assignment: '${assignmentName}'
      
      This evaluation was submitted after the deadline, and we wanted to make sure you didn't miss it
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer`,
    };
  },
};

export { EmailTemplate, templates };
