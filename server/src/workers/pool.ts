import workerpool from "workerpool";
import path from "path";

const startDistributeReviewsForAssignmentWorker = function (
  assignmentId: number
): void {
  const pool = workerpool.pool(
    path.resolve(__dirname, "./reviewDistribution.js")
  );
  // start asynchronous worker for the review distribution
  pool
    .exec("distributeReviewsForAssignment", [assignmentId])
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.error(err);
    });
};

export default startDistributeReviewsForAssignmentWorker;
