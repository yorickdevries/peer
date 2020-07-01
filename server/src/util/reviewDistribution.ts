import jsgraphs from "js-graph-algorithms";
import _ from "lodash";
import Submission from "../models/Submission";
import User from "../models/User";

interface reviewAssignment {
  user: User;
  submission: Submission;
}

// Takes care of the distribution of reviews of submissions over the students
const generateReviewDistribution = async function (
  submissions: Submission[],
  users: User[],
  reviewsPerUser: number
): Promise<reviewAssignment[]> {
  // basic validation
  if (reviewsPerUser < 1 || !Number.isInteger(reviewsPerUser)) {
    throw new Error("reviewsPerUser should be a positive integer");
  }
  // If there are less submissions than required to review per person, then no division can be made
  if (submissions.length - 1 < reviewsPerUser) {
    throw new Error(
      `There are not enough submissions to assign the required number of reviewsPerUser: ${reviewsPerUser}`
    );
  }
  // If there are less users * reviews per user than submissions
  // then no division can be made as there will be submissions without reviews
  if (submissions.length > users.length * reviewsPerUser) {
    throw new Error("There are not enough users for the number of submissions");
  }

  // findDistribution will try max 10 times to find a distribution (to avoid infinite loops)
  // it will thor an error if no solution is found
  const reviewDistribution = await findDistribution(
    submissions,
    users,
    reviewsPerUser
  );
  return reviewDistribution;
};

const findDistribution = async function (
  submissions: Submission[],
  users: User[],
  reviewsPerUser: number
) {
  // calculate ideal upper and lower bounds
  const totalNumberOfReviews = reviewsPerUser * users.length;
  const averageNumberOfReviewsPerSubmission =
    totalNumberOfReviews / submissions.length;
  // lowerbound of at least 1
  let minNumberOfReviewsPerSubmission = Math.max(
    1,
    Math.floor(averageNumberOfReviewsPerSubmission)
  );
  // upperbound of at least 1
  let maxNumberOfReviewsPerSubmission = Math.max(
    1,
    Math.ceil(averageNumberOfReviewsPerSubmission)
  );

  // make shuffled arrays to remove determinism
  const shuffledUsers = _.shuffle(users);
  const shuffledSubmissions = _.shuffle(submissions);

  // initialize result and attemptcounter
  const maxAttempts = 10;
  let reviewDistribution = undefined;
  let counter = 0;
  // attempt 10 times to make a distribution
  while (!reviewDistribution && counter < maxAttempts) {
    reviewDistribution = await performMaxFlow(
      shuffledSubmissions,
      shuffledUsers,
      reviewsPerUser,
      minNumberOfReviewsPerSubmission,
      maxNumberOfReviewsPerSubmission
    );
    if (counter % 2 === 0 && minNumberOfReviewsPerSubmission > 1) {
      // decrease lowerbound
      minNumberOfReviewsPerSubmission--;
    } else {
      // increase upperbound
      maxNumberOfReviewsPerSubmission++;
    }
    counter++;
  }
  // if still no Distribution is found, an error is thrown
  if (!reviewDistribution) {
    throw new Error("No review distribution could be made");
  }
  return reviewDistribution;
};

// Based on the TI2306 Algorithm Design lectures
const performMaxFlow = async function (
  submissions: Submission[],
  users: User[],
  reviewsPerUser: number,
  minNumberOfReviewsPerSubmission: number,
  maxNumberOfReviewsPerSubmission: number
) {
  // k number of users
  const k = users.length;
  // n number of submissions
  const n = submissions.length;
  // total reviews
  const totalNumberOfReviews = reviewsPerUser * k;
  // lowerbound c
  const c = minNumberOfReviewsPerSubmission;
  // upperbound C
  const C = maxNumberOfReviewsPerSubmission;

  // 2 sources s and s'
  const SOURCE = 0;
  const SOURCE_PRIME = 1;
  // 2 targets t and t'
  const TARGET = 2;
  const TARGET_PRIME = 3;
  const numberOfNodes = 4 + k + n;

  // functions to convert node numbers
  const nodeNumberOfUserIndex = function (userIndex: number) {
    return 4 + userIndex;
  };
  const userIndexOfNodeNumber = function (nodeNumber: number) {
    return nodeNumber - 4;
  };
  const nodeNumberOfSubmissionIndex = function (submissionIndex: number) {
    return 4 + k + submissionIndex;
  };
  const submissionIndexOfNodeNumber = function (nodeNumber: number) {
    return nodeNumber - (4 + k);
  };

  // flow graph
  const graph = new jsgraphs.FlowNetwork(numberOfNodes);
  // add 1 edge with the capacity of the total number of reviews between SOURCE_PRIME and SOURCE
  graph.addEdge(
    new jsgraphs.FlowEdge(SOURCE_PRIME, SOURCE, totalNumberOfReviews)
  );

  // 1 SOURCE edge for every user with capacity reviewsPerUser
  for (let i = 0; i < k; i++) {
    graph.addEdge(
      new jsgraphs.FlowEdge(SOURCE, nodeNumberOfUserIndex(i), reviewsPerUser)
    );
  }

  // fetch all submissionGroupUsers so these can be checked in subsequent loop
  const groupUsersOfSubmissions: User[][] = [];
  for (let j = 0; j < n; j++) {
    const submission = submissions[j];
    const group = await submission.getGroup();
    const users = await group.getUsers();
    groupUsersOfSubmissions.push(users);
  }
  // 1 connection per user to submission if the user isn't in the submissiongroup
  for (let i = 0; i < k; i++) {
    const user = users[i];
    // iterate over the groups of the submissions
    for (let j = 0; j < n; j++) {
      const groupUsersOfSubmission = groupUsersOfSubmissions[j];
      if (
        !_.some(groupUsersOfSubmission, (groupUser) => {
          return groupUser.netid === user.netid;
        })
      ) {
        // add edge with capacity 1 if the user can review the submission
        graph.addEdge(
          new jsgraphs.FlowEdge(
            nodeNumberOfUserIndex(i),
            nodeNumberOfSubmissionIndex(j),
            1
          )
        );
      }
    }
  }

  // 1 connection of capacity c to TARGET_PRIME per submission
  // 1 connection of capacity C-c to TARGET per submission
  for (let j = 0; j < n; j++) {
    graph.addEdge(
      new jsgraphs.FlowEdge(nodeNumberOfSubmissionIndex(j), TARGET_PRIME, c)
    );
    graph.addEdge(
      new jsgraphs.FlowEdge(nodeNumberOfSubmissionIndex(j), TARGET, C - c)
    );
  }

  // last edge from TARGET to TARGET_PRIME of totalNumberOfReviews - n * c
  graph.addEdge(
    new jsgraphs.FlowEdge(TARGET, TARGET_PRIME, totalNumberOfReviews - n * c)
  );

  // perform ford fulkerson
  const fordFulkerson = new jsgraphs.FordFulkerson(
    graph,
    SOURCE_PRIME,
    TARGET_PRIME
  );

  // get the minCut to determine the reviewdistribution
  const minCut = fordFulkerson.minCut(graph);
  const reviewDistribution: reviewAssignment[] = [];
  for (let i = 0; i < minCut.length; i++) {
    const edge = minCut[i];
    const from = edge.from();
    const to = edge.to();
    // check whether this is an assignment of a user to submission
    // and not an edge from source/sink
    if (from > 3 && to > 3) {
      const user = users[userIndexOfNodeNumber(from)];
      const submission = submissions[submissionIndexOfNodeNumber(to)];
      reviewDistribution.push({ user: user, submission: submission });
    }
  }
  // check if the max flow is achieved
  if (totalNumberOfReviews !== reviewDistribution.length) {
    console.log(`MaxFlow not achieved: ${reviewDistribution.length}`);
    return undefined;
  } else {
    console.log(`MaxFlow achieved: ${reviewDistribution.length}`);
    return reviewDistribution;
  }
};

export default generateReviewDistribution;
