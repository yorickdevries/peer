import { distributeReviewsForAssignment } from "../assignmentProgression/distributeReviews";
import openFeedbackForAssignment from "./openFeedback";
import importGroupsForAssignment from "./importGroups";
import copyGroupsForAssignment from "./copyGroups";
import exportGradesForAssignmentVersion from "./exportGrades";
import exportReviewsForAssignmentVersion from "./exportReviews";
import exportSubmissionsForAssignmentVersion from "./exportSubmissions";

const workerFunctions = {
  distributeReviewsForAssignment: distributeReviewsForAssignment,
  openFeedbackForAssignment: openFeedbackForAssignment,
  importGroupsForAssignment: importGroupsForAssignment,
  copyGroupsForAssignment: copyGroupsForAssignment,
  exportGradesForAssignmentVersion: exportGradesForAssignmentVersion,
  exportReviewsForAssignmentVersion: exportReviewsForAssignmentVersion,
  exportSubmissionsForAssignmentVersion: exportSubmissionsForAssignmentVersion,
};

export default workerFunctions;
