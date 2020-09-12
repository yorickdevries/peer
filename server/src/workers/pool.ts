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
    workerFunctions
      .distributeReviewsForAssignment(assignmentId)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
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
    workerFunctions
      .openFeedbackForAssignment(assignmentId)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
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
    workerFunctions
      .importGroupsForAssignment(assignmentId, groupNameWithNetidLists)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("importGroupsForAssignment", [
      assignmentId,
      groupNameWithNetidLists,
    ]);
  }
};

const startCopyGroupsForAssignmentWorker = function (
  assignmentId: number,
  copyFromAssignmentId: number
): void {
  if (process.env.TS_NODE) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .copyGroupsForAssignment(assignmentId, copyFromAssignmentId)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("copyGroupsForAssignment", [
      assignmentId,
      copyFromAssignmentId,
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
    workerFunctions
      .exportGradesForAssignment(assignmentId, assignmentExportId, exportType)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
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
    workerFunctions
      .exportReviewsForAssignment(assignmentId, assignmentExportId, exportType)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
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
  startCopyGroupsForAssignmentWorker,
  startExportGradesForAssignmentWorker,
  startExportReviewsForAssignmentWorker,
};
