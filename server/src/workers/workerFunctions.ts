import { distributeReviewsForAssignment } from "./distributeReviews";
import openFeedbackForAssignment from "./openFeedback";
import importGroupsForAssignment from "./importGroups";
import copyGroupsForAssignment from "./copyGroups";
import exportGradesForAssignment from "./exportGrades";
import exportReviewsForAssignment from "./exportReviews";

const workerFunctions = {
  distributeReviewsForAssignment: distributeReviewsForAssignment,
  openFeedbackForAssignment: openFeedbackForAssignment,
  importGroupsForAssignment: importGroupsForAssignment,
  copyGroupsForAssignment: copyGroupsForAssignment,
  exportGradesForAssignment: exportGradesForAssignment,
  exportReviewsForAssignment: exportReviewsForAssignment,
};

export default workerFunctions;
