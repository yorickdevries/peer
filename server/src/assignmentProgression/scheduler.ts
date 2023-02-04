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
import {sendMailForMissingStageSubmission} from "../util/mailer";

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
  // delete from scheduledJobs
  scheduledJobs.delete(assignment.id);
};

const scheduleJobsForAssignment = function (assignment: Assignment): void {
  // first cancel all jobs if any
  cancelJobsForAssignment(assignment);
  if (assignment.automaticStateProgression) {
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
      // job can be null if scheduled in the past
      if (job) {
        jobsOfAssignment.push(job);
      }
    }
    // closeSubmission
    if (
      assignment.isAtOrBeforeState(AssignmentState.SUBMISSION) &&
      moment(now).isBefore(assignment.dueDate)
    ) {
      const closeSubmissionDate = assignment.lateSubmissions
        ? moment(assignment.reviewPublishDate).subtract("15", "m").toDate()
        : assignment.dueDate;

      const job = schedule.scheduleJob(closeSubmissionDate, () => {
        startCloseSubmissionForAssignmentWorker(assignment.id);
      });
      // job can be null if scheduled in the past
      if (job) {
        jobsOfAssignment.push(job);
      }
    }
    // distributeReviews
    if (
      assignment.isAtOrBeforeState(AssignmentState.WAITING_FOR_REVIEW) &&
      moment(now).isBefore(assignment.reviewPublishDate)
    ) {
      const job = schedule.scheduleJob(assignment.reviewPublishDate, () => {
        startDistributeReviewsForAssignmentWorker(assignment.id);
      });
      // job can be null if scheduled in the past
      if (job) {
        jobsOfAssignment.push(job);
      }
    }
    // openFeedback
    if (
      assignment.isAtOrBeforeState(AssignmentState.REVIEW) &&
      moment(now).isBefore(assignment.reviewDueDate)
    ) {
      const job = schedule.scheduleJob(assignment.reviewDueDate, () => {
        startOpenFeedbackForAssignmentWorker(assignment.id);
      });
      // job can be null if scheduled in the past
      if (job) {
        jobsOfAssignment.push(job);
      }
    }
    // set new value
    scheduledJobs.set(assignment.id, jobsOfAssignment);
  }
};

const scheduleReminderJob = function (): void {
  schedule.scheduleJob("7 1 * * *", () => {
    sendMailForMissingStageSubmission()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  });
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

  scheduleReminderJob();
  console.log("Scheduled stage reminder job");
};

export { scheduleAllJobs, scheduleJobsForAssignment };
