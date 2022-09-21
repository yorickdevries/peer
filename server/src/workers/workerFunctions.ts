import publishAssignment from "../assignmentProgression/publishAssignment";
import closeSubmission from "../assignmentProgression/closeSubmission";
import { distributeReviewsForAssignment } from "../assignmentProgression/distributeReviews";
import openFeedbackForAssignment from "../assignmentProgression/openFeedback";
import importGroupsForAssignment from "./importGroups";
import copyGroupsForAssignment from "./copyGroups";
import exportGradesForAssignmentVersion from "./exportGrades";
import exportReviewsForAssignmentVersion from "./exportReviews";
import exportSubmissionsForAssignmentVersion from "./exportSubmissions";
import submissionFlagging from "./submissionFlagging";
//import importWebLabSubmissions from "./importSubmissions";

const workerFunctions = {
  publishAssignment: publishAssignment,
  closeSubmission: closeSubmission,
  distributeReviewsForAssignment: distributeReviewsForAssignment,
  openFeedbackForAssignment: openFeedbackForAssignment,
  importGroupsForAssignment: importGroupsForAssignment,
  copyGroupsForAssignment: copyGroupsForAssignment,
  exportGradesForAssignmentVersion: exportGradesForAssignmentVersion,
  exportReviewsForAssignmentVersion: exportReviewsForAssignmentVersion,
  exportSubmissionsForAssignmentVersion: exportSubmissionsForAssignmentVersion,
  submissionFlagging: submissionFlagging,
  //importWebLabSubmissions: importWebLabSubmissions,
};

export default workerFunctions;
