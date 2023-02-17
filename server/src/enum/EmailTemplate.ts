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
      
      Don't forget to submit something before the deadline so that others can review your work.
      Deadline: ${dueDate}
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer
      (Don't want to receive these messages? Unsubscribe via the website under your profile settings)`,
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
      
      Don't forget to submit your reviews before the deadline so that others can see what you thought of their work.
      Deadline: ${dueDate}
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer
      (Don't want to receive these messages? Unsubscribe via the website under your profile settings)`,
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
      
      Don't forget to evaluate all reviews you received before the deadline so that other students can improve their reviews for the future.
      Deadline: ${dueDate}
      
      You can access the website at: https://peer.ewi.tudelft.nl
      
      - Peer
      (Don't want to receive these messages? Unsubscribe via the website under your profile settings)`,
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
      
      - Peer
      (Don't want to receive these messages? Unsubscribe via the website under your profile settings)`,
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
      
      - Peer
      (Don't want to receive these messages? Unsubscribe via the website under your profile settings)`,
    };
  },
};

export { EmailTemplate, templates };
