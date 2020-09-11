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
  pool
    .exec(functionName, functionArguments)
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.error(err);
    });
};

const startDistributeReviewsForAssignmentWorker = function (
  assignmentId: number
): void {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    const result = workerFunctions.distributeReviewsForAssignment(assignmentId);
    console.log(result);
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("distributeReviewsForAssignment", [assignmentId]);
  }
};

const startOpenFeedbackForAssignmentWorker = function (
  assignmentId: number
): void {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    const result = workerFunctions.openFeedbackForAssignment(assignmentId);
    console.log(result);
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("openFeedbackForAssignment", [assignmentId]);
  }
};

interface groupNameWithNetidList {
  groupName: string;
  netids: string[];
}

const startImportGroupsForAssignmentWorker = function (
  assignmentId: number,
  groupNameWithNetidLists: groupNameWithNetidList[]
): void {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    const result = workerFunctions.importGroupsForAssignment(
      assignmentId,
      groupNameWithNetidLists
    );
    console.log(result);
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("importGroupsForAssignment", [
      assignmentId,
      groupNameWithNetidLists,
    ]);
  }
};

const startExportGradesForAssignmentWorker = function (
  assignmentId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): void {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    const result = workerFunctions.exportGradesForAssignment(
      assignmentId,
      assignmentExportId,
      exportType
    );
    console.log(result);
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("exportGradesForAssignment", [
      assignmentId,
      assignmentExportId,
      exportType,
    ]);
  }
};

const startExportReviewsForAssignmentWorker = function (
  assignmentId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): void {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    const result = workerFunctions.exportReviewsForAssignment(
      assignmentId,
      assignmentExportId,
      exportType
    );
    console.log(result);
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("exportReviewsForAssignment", [
      assignmentId,
      assignmentExportId,
      exportType,
    ]);
  }
};

export {
  startDistributeReviewsForAssignmentWorker,
  startOpenFeedbackForAssignmentWorker,
  startImportGroupsForAssignmentWorker,
  startExportGradesForAssignmentWorker,
  startExportReviewsForAssignmentWorker,
};
