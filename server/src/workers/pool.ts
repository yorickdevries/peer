import workerpool from "workerpool";
import path from "path";
import workerFunctions from "./workerFunctions";

// refer to the compiled .js workers
const pool = workerpool.pool(path.resolve(__dirname, "./workers.js"));

// start an arbitrary worker function
const startWorker = function (
  functionName: keyof typeof workerFunctions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  functionArguments: any[]
) {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    const workerFunction = workerFunctions[functionName];
    if (workerFunction.length === functionArguments.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workerFunctionArguments = functionArguments as any;
      // run the function directly
      // eslint-disable-next-line prefer-spread
      workerFunction
        .apply(null, workerFunctionArguments)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      throw new Error("Invalid number of function arguments");
    }
  } else {
    // run worker in a seperate process (Node.js/production)
    pool
      .exec(functionName, functionArguments)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

const startDistributeReviewsForAssignmentWorker = function (
  assignmentId: number
): void {
  startWorker("distributeReviewsForAssignment", [assignmentId]);
};

const startOpenFeedbackForAssignmentWorker = function (
  assignmentId: number
): void {
  startWorker("openFeedbackForAssignment", [assignmentId]);
};

export {
  startDistributeReviewsForAssignmentWorker,
  startOpenFeedbackForAssignmentWorker,
};
