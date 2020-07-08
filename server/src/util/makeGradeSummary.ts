import Review from "../models/Review";
import _ from "lodash";

interface gradeSummary {
  netid: string;
  studentnumber: number;
  approved: number;
  disapproved: number;
  waitingForApproval: number;
  flaggedByReviewer: number;
}

const makeGradeSummaries = function (reviews: Review[]): gradeSummary[] {
  // iterate over all reviews and save the data
  const gradeSummaryMap = new Map<string, gradeSummary>();
  for (const review of reviews) {
    const reviewer = review.reviewer;
    let userGradeSummary = gradeSummaryMap.get(reviewer.netid);
    if (!userGradeSummary) {
      userGradeSummary = {
        netid: reviewer.netid,
        studentnumber: reviewer.studentNumber!,
        approved: 0,
        disapproved: 0,
        waitingForApproval: 0,
        flaggedByReviewer: 0,
      };
    }
    if (review.approvalByTA === null) {
      userGradeSummary.waitingForApproval += 1;
    } else if (review.approvalByTA) {
      userGradeSummary.approved += 1;
    } else {
      userGradeSummary.disapproved += 1;
    }
    if (review.flaggedByReviewer) {
      userGradeSummary.flaggedByReviewer += 1;
    }
    gradeSummaryMap.set(reviewer.netid, userGradeSummary);
  }
  const gradeSummaries: gradeSummary[] = [];
  for (const gradeSummary of gradeSummaryMap.values()) {
    gradeSummaries.push(gradeSummary);
  }
  return gradeSummaries;
};

export default makeGradeSummaries;
