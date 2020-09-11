import distributeReviewsForAssignment from "./distributeReviews";
import openFeedbackForAssignment from "./openFeedback";
import importGroupsForAssignment from "./importGroups";
import exportGradesForAssignment from "./exportGrades";
import exportReviewsForAssignment from "./exportReviews";

const workerFunctions = {
  distributeReviewsForAssignment: distributeReviewsForAssignment,
  openFeedbackForAssignment: openFeedbackForAssignment,
  importGroupsForAssignment: importGroupsForAssignment,
  exportGradesForAssignment: exportGradesForAssignment,
  exportReviewsForAssignment: exportReviewsForAssignment,
};

export default workerFunctions;
