import moment from "moment";
import schedule from "node-schedule";
import { AssignmentState } from "../enum/AssignmentState";
import Assignment from "../models/Assignment";
import {
  startPublishAssignmentWorker,
  startCloseSubmissionForAssignmentWorker,
  startDistributeReviewsForAssignmentWorker,
  startOpenFeedbackForAssignmentWorker,
} from "../workers/pool";

// map assignments to jobs
const scheduledJobs: Map<number, schedule.Job[]> = new Map<
  number,
  schedule.Job[]
>();

const cancelJobsForAssignment = function (assignment: Assignment) {
  const jobsOfAssignment = scheduledJobs.get(assignment.id);
  if (jobsOfAssignment) {
    for (const job of jobsOfAssignment) {
      job.cancel();
    }
  }
};

const scheduleJobsForAssignment = function (assignment: Assignment): void {
  // first cancel all jobs if any
  cancelJobsForAssignment(assignment);
  // create new jobs
  const jobsOfAssignment = [];
  const now = new Date();
  // publishAssignment
  if (
    assignment.isAtOrBeforeState(AssignmentState.UNPUBLISHED) &&
    moment(now).isBefore(assignment.publishDate)
  ) {
    const job = schedule.scheduleJob(assignment.publishDate, () => {
      startPublishAssignmentWorker(assignment.id);
    });
    jobsOfAssignment.push(job);
  }
  // closeSubmission
  if (
    assignment.isAtOrBeforeState(AssignmentState.SUBMISSION) &&
    moment(now).isBefore(assignment.dueDate)
  ) {
    const job = schedule.scheduleJob(assignment.dueDate, () => {
      startCloseSubmissionForAssignmentWorker(assignment.id);
    });
    jobsOfAssignment.push(job);
  }
  // distributeReviews
  if (
    assignment.isAtOrBeforeState(AssignmentState.WAITING_FOR_REVIEW) &&
    moment(now).isBefore(assignment.reviewPublishDate)
  ) {
    const job = schedule.scheduleJob(assignment.reviewPublishDate, () => {
      startDistributeReviewsForAssignmentWorker(assignment.id);
    });
    jobsOfAssignment.push(job);
  }
  // openFeedback
  if (
    assignment.isAtOrBeforeState(AssignmentState.REVIEW) &&
    moment(now).isBefore(assignment.reviewDueDate)
  ) {
    const job = schedule.scheduleJob(assignment.reviewDueDate, () => {
      startOpenFeedbackForAssignmentWorker(assignment.id);
    });
    jobsOfAssignment.push(job);
  }
  // set new value
  scheduledJobs.set(assignment.id, jobsOfAssignment);
};

const scheduleAllJobs = async function (): Promise<void> {
  // find all assignments
  const assignments = await Assignment.find();
  for (const assignment of assignments) {
    scheduleJobsForAssignment(assignment);
  }
  let counter = 0;
  for (const element of scheduledJobs) {
    counter += element[1].length;
  }
  console.log(`Scheduled ${counter} jobs`);
};

export { scheduleAllJobs, scheduleJobsForAssignment };
