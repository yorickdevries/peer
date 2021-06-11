import workerpool from "workerpool";
import path from "path";
import workerFunctions from "./workerFunctions";
import isTSNode from "../util/isTSNode";

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

const startPublishAssignmentWorker = function (assignmentId: number): void {
  if (isTSNode) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .publishAssignment(assignmentId)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("publishAssignment", [assignmentId]);
  }
};

const startCloseSubmissionForAssignmentWorker = function (
  assignmentId: number
): void {
  if (isTSNode) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .closeSubmission(assignmentId)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("closeSubmission", [assignmentId]);
  }
};

const startDistributeReviewsForAssignmentWorker = function (
  assignmentId: number
): void {
  if (isTSNode) {
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
  if (isTSNode) {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const startSubmissionFlaggingWorker = function (submissionId: number): void {
  if (isTSNode) {
    workerFunctions
      .submissionFlagging(submissionId)
      .then((result) => console.log(result))
      .catch((err) => console.error(err));
  } else {
    startWorker("submissionFlagging", [submissionId]);
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
  if (isTSNode) {
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
  if (isTSNode) {
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

const startExportGradesForAssignmentVersionWorker = function (
  assignmentVersionId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): void {
  if (isTSNode) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .exportGradesForAssignmentVersion(
        assignmentVersionId,
        assignmentExportId,
        exportType
      )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("exportGradesForAssignmentVersion", [
      assignmentVersionId,
      assignmentExportId,
      exportType,
    ]);
  }
};

const startExportReviewsForAssignmentVersionWorker = function (
  assignmentVersionId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): void {
  if (isTSNode) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .exportReviewsForAssignmentVersion(
        assignmentVersionId,
        assignmentExportId,
        exportType
      )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("exportReviewsForAssignmentVersion", [
      assignmentVersionId,
      assignmentExportId,
      exportType,
    ]);
  }
};

const startExportSubmissionsForAssignmentVersionWorker = function (
  assignmentVersionId: number,
  assignmentExportId: number,
  exportType: "xls" | "csv"
): void {
  if (isTSNode) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .exportSubmissionsForAssignmentVersion(
        assignmentVersionId,
        assignmentExportId,
        exportType
      )
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("exportSubmissionsForAssignmentVersion", [
      assignmentVersionId,
      assignmentExportId,
      exportType,
    ]);
  }
};

const startImportWebLabSubmissionsWorker = function (
  assignmentVersionId: number,
  file: Express.Multer.File
): void {
  if (isTSNode) {
    // run the function directly in this process (TS Node/development)
    workerFunctions
      .importWebLabSubmissions(assignmentVersionId, file)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    // run worker in a seperate process (Node.js/production)
    startWorker("importWebLabSubmissions", [
      assignmentVersionId,
      file,
    ]);
  }
};

export {
  startPublishAssignmentWorker,
  startCloseSubmissionForAssignmentWorker,
  startDistributeReviewsForAssignmentWorker,
  startOpenFeedbackForAssignmentWorker,
  startImportGroupsForAssignmentWorker,
  startCopyGroupsForAssignmentWorker,
  startExportGradesForAssignmentVersionWorker,
  startExportReviewsForAssignmentVersionWorker,
  startExportSubmissionsForAssignmentVersionWorker,
  startSubmissionFlaggingWorker,
  startImportWebLabSubmissionsWorker,
};
