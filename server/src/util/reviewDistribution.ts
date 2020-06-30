import jsgraphs from "js-graph-algorithms";
import _ from "lodash";
import Submission from "../models/Submission";
import User from "../models/User";

// Takes care of the distribution of all reviews over the students
const generateDistribution = async function (
  submissions: Submission[],
  users: User[],
  reviewsPerUser: number
) {
  // basic validation
  if (reviewsPerUser < 1 || !Number.isInteger(reviewsPerUser)) {
    throw new Error("reviewsPerUser should be a positive integer");
  }
  // If there are less submissions than required to review per person, then no division can be made
  if (submissions.length - 1 < reviewsPerUser) {
    throw new Error(
      "There are not enough submissions to assign the required number of reviewsPerUser: " +
        reviewsPerUser
    );
  }
  // If there are less users * reviews per user than submissions
  // then no division can be made
  if (submissions.length > users.length * reviewsPerUser) {
    throw new Error("There are not enough users for the number of submissions");
  }
  // assigning can start here
  // try 10 times
  await performMaxFlow(submissions, users, reviewsPerUser);
  return;
};

const performMaxFlow = async function (
  submissions: Submission[],
  users: User[],
  reviewsPerUser: number
) {
  // n number of users
  const k = users.length;
  // m number of submissions
  const n = submissions.length;
  // total reviews
  const totalNumberOfReviews = reviewsPerUser * k;
  const averageNumberOfReviewsPerSubmission = totalNumberOfReviews / n;
  // lowerbound
  const c = Math.floor(averageNumberOfReviewsPerSubmission);
  // upperbound
  const C = Math.ceil(averageNumberOfReviewsPerSubmission);

  // 2 sources s and s'
  const SOURCE = 0;
  const SOURCE_PRIME = 1;
  // 2 targets t and t'
  const TARGET = 2;
  const TARGET_PRIME = 3;
  const numberOfNodes = 4 + k + n;

  const nodeNumberOfUserIndex = function (userIndex: number) {
    return 4 + userIndex;
  };
  const nodeNumberOfSubmissionIndex = function (submissionIndex: number) {
    return 4 + k + submissionIndex;
  };

  const graph = new jsgraphs.FlowNetwork(numberOfNodes);
  // total flow
  graph.addEdge(
    new jsgraphs.FlowEdge(SOURCE_PRIME, SOURCE, totalNumberOfReviews)
  );

  // 1 SOURCE_PRIME edge for every user
  for (let i = 0; i < k; i++) {
    graph.addEdge(
      new jsgraphs.FlowEdge(SOURCE, nodeNumberOfUserIndex(i), reviewsPerUser)
    );
  }

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
    // iterate over the groups
    for (let j = 0; j < n; j++) {
      const groupUsersOfSubmission = groupUsersOfSubmissions[j];
      if (
        !_.some(groupUsersOfSubmission, (groupUser) => {
          return groupUser.netid === user.netid;
        })
      ) {
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

  // 1 connection of c to TARGET_PRIME per submission
  // 1 connection of C-c to TARGET per submission
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

  console.log("performing max flow");
  const fordFulkerson = new jsgraphs.FordFulkerson(
    graph,
    SOURCE_PRIME,
    TARGET_PRIME
  );
  console.log(`MaxFlow: ${fordFulkerson.value}`);

  const minCut = fordFulkerson.minCut(graph);

  // needs to be checked and used
  for (let i = 0; i < minCut.length; i++) {
    const e = minCut[i];
    console.log(`min-cut: (${e.from()}, ${e.to()})`);
  }
  return;
};

export default generateDistribution;
