import openFeedbackForAssignment from "./openFeedback";
import distributeReviewsForAssignment from "./reviewDistribution";

const workerFunctions = {
  distributeReviewsForAssignment: distributeReviewsForAssignment,
  openFeedbackForAssignment: openFeedbackForAssignment,
};

export default workerFunctions;
