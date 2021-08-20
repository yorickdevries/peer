import jsgraphs from "js-graph-algorithms";
import _ from "lodash";
import Submission from "../models/Submission";
import User from "../models/User";
import Assignment from "../models/Assignment";
import ReviewOfSubmission from "../models/ReviewOfSubmission";
import { getManager } from "typeorm";
import Review from "../models/Review";
import { AssignmentState } from "../enum/AssignmentState";
import ensureConnection from "../util/ensureConnection";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { sendMailToTeachersOfAssignment } from "../util/mailer";
import CheckboxQuestion from "../models/CheckboxQuestion";
import MultipleChoiceQuestion from "../models/MultipleChoiceQuestion";

interface reviewAssignment {
  reviewer: User;
  submission: Submission;
  submissionQuestionnaire: SubmissionQuestionnaire;
}

const getUniqueUsersOfSubmissions = async function (submissions: Submission[]) {
  // get all unique users of the submissions (unique as several submissions might have the same user in the group)
  const users: User[] = [];
  for (const submission of submissions) {
    const group = await submission.getGroup();
    const groupUsers = await group.getUsers();
    for (const groupUser of groupUsers) {
      const alreadyContainsUser = _.some(users, (user) => {
        return user.netid === groupUser.netid;
      });
      if (!alreadyContainsUser) {
        users.push(groupUser);
      }
    }
  }
  return users;
};

const distributeReviewsForAssignmentHelper = async function (
  assignment: Assignment
): Promise<string> {
  // assignmentstate
  if (!assignment.isAtState(AssignmentState.WAITING_FOR_REVIEW)) {
    throw new Error(
      "The submission state has not been passed or reviews are already assigned"
    );
  }
  for (const assignmentVersion of assignment.versions) {
    const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
    if (!questionnaire) {
      throw new Error("Questionnaire not found");
    }
    if (questionnaire.questions.length === 0) {
      throw new Error("The questionnaire doesn't have questions");
    }
    // check whether there is a question without option:
    for (const question of questionnaire.questions) {
      if (
        question instanceof CheckboxQuestion ||
        question instanceof MultipleChoiceQuestion
      ) {
        if (question.options.length === 0) {
          throw new Error(
            "One of the questions in the questionnaire doesn't have options"
          );
        }
      }
    }
    // check for existing reviews
    const existingReviews = await questionnaire.getReviews();
    if (existingReviews.length > 0) {
      throw new Error("There are already reviews for this assignment");
    }
  }
  // Check whether all versions are reviewed
  // and all VersionsToReview are not empty
  // check for every version whether it is reviewed
  for (const assignmentVersion of assignment.versions) {
    if ((await assignmentVersion.getVersionsToReview()).length === 0) {
      throw new Error(
        `assignmentVersion with id ${assignmentVersion.id} is not reviewing any assignmentVersions`
      );
    }
    let isReviewed = false;
    // check all other assignmentversions
    for (const otherAssignmentVersion of assignment.versions) {
      const versionsToReview = await otherAssignmentVersion.getVersionsToReview();
      // check all other assignmentversions whether it is reviewing the version
      for (const versionToReview of versionsToReview) {
        if (versionToReview.id === assignmentVersion.id) {
          isReviewed = true;
        }
      }
    }
    if (!isReviewed) {
      throw new Error(
        `assignmentVersion with id ${assignmentVersion.id} is not reviewed by another assignmentVersion`
      );
    }
  }

  // make a map which connects the assignmentversions to the users it is reviewed by
  const assignmentVersionsReviewedByMap: Map<
    number, // assignmentversion id
    [User, number][] // user-number of reviews user must do tuple
  > = new Map();

  // make a map of the final submissions per assignmentversion
  const finalSubmissionsOfEachGroupMap: Map<
    number, // assignmentversion id
    Submission[]
  > = new Map();

  for (const assignmentVersion of assignment.versions) {
    // the users of these submissions will be reviewing
    finalSubmissionsOfEachGroupMap.set(
      assignmentVersion.id,
      await assignmentVersion.getFinalSubmissionsOfEachGroup()
    );
    // initialize with empty lists to be filled in the subsequent loop
    assignmentVersionsReviewedByMap.set(assignmentVersion.id, []);
  }

  // iterate over the versions and fill the map
  for (const assignmentVersion of assignment.versions) {
    // number of reviews specific to that version
    const reviewsPerUserPerAssignmentVersionToReview =
      assignmentVersion.reviewsPerUserPerAssignmentVersionToReview;
    // set the users of these submissions will be reviewing
    const finalSubmissionsOfEachGroup = finalSubmissionsOfEachGroupMap.get(
      assignmentVersion.id
    );
    if (finalSubmissionsOfEachGroup === undefined) {
      // should never happen
      throw new Error(
        `finalSubmissionsOfEachGroup of assignmentVersion with id ${assignmentVersion.id} is undefined`
      );
    }
    const newReviewedByList: [User, number][] = [];
    const usersOfLatestSubmissions = await getUniqueUsersOfSubmissions(
      finalSubmissionsOfEachGroup
    );
    for (const userOfLatestSubmissions of usersOfLatestSubmissions) {
      // add one user to the list
      newReviewedByList.push([
        userOfLatestSubmissions,
        reviewsPerUserPerAssignmentVersionToReview,
      ]);
    }

    // iterate over all verions which needs to be reviewed and add the users to the map
    const versionsToReview = await assignmentVersion.getVersionsToReview();
    for (const assignmentVersionToReview of versionsToReview) {
      // get list of current users it is reviewd by
      const oldReviewedByList = assignmentVersionsReviewedByMap.get(
        assignmentVersionToReview.id
      );
      if (oldReviewedByList === undefined) {
        // should never happen
        throw new Error(
          `assignmentVersion with id ${assignmentVersionToReview.id} is of the wrong assignment`
        );
      } else {
        // add the users of the assignment version that is reviewing the assignment to the reviewed By list
        oldReviewedByList.push(...newReviewedByList);
      }
    }
  }

  // MAKE REVIEW DISTRIBUTION
  const fullReviewDistribution: reviewAssignment[] = [];

  // first, create self reviews
  for (const assignmentVersion of assignment.versions) {
    // create selfreviews if needed
    if (assignmentVersion.selfReview) {
      // the users of these submissions will be reviewing
      const finalSubmissionsOfEachGroup = finalSubmissionsOfEachGroupMap.get(
        assignmentVersion.id
      );
      if (finalSubmissionsOfEachGroup === undefined) {
        // should never happen
        throw new Error(
          `assignmentVersion with id ${assignmentVersion.id} is not part of the map`
        );
      }
      const selfReviewAssignments = await generateSelfReviews(
        finalSubmissionsOfEachGroup
      );
      fullReviewDistribution.push(...selfReviewAssignments);
    }
  }

  // assignmentVersions of which the users will be reviewed
  for (const assignmentVersion of assignment.versions) {
    // submissions which need to be reviewed
    const finalSubmissionsOfEachGroup = finalSubmissionsOfEachGroupMap.get(
      assignmentVersion.id
    );
    if (finalSubmissionsOfEachGroup === undefined) {
      // should never happen
      throw new Error(
        `assignmentVersion with id ${assignmentVersion.id} is not part of the map`
      );
    }
    // the users, number of reviews of these submissions will be reviewing
    const reviewedByList = assignmentVersionsReviewedByMap.get(
      assignmentVersion.id
    );
    if (reviewedByList === undefined) {
      // should never happen
      throw new Error(
        `assignmentVersion with id ${assignmentVersion.id} is of the wrong assignment`
      );
    }
    const reviewDistributionForCurrentVersion = await generateReviewDistribution(
      finalSubmissionsOfEachGroup,
      reviewedByList
    );
    // add the distribution to fullReviewDistribution
    fullReviewDistribution.push(...reviewDistributionForCurrentVersion);
  }

  // create all reviews in an transaction
  await getManager().transaction(
    "SERIALIZABLE", // serializable is the only way to make sure to reviews exist before creating them
    async (transactionalEntityManager) => {
      for (const assignmentVersion of assignment.versions) {
        const questionnaire = await assignmentVersion.getSubmissionQuestionnaire();
        if (!questionnaire) {
          throw new Error("Questionnaire not found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const existingReviews = await transactionalEntityManager.find(Review, {
          where: { questionnaire: questionnaire },
        });
        if (existingReviews.length > 0) {
          throw new Error("There are already reviews for this assignment");
        }
      }

      // iterate over fullReviewDistribution
      for (const reviewAssignment of fullReviewDistribution) {
        // make the review
        const review = new ReviewOfSubmission(
          reviewAssignment.submissionQuestionnaire,
          reviewAssignment.reviewer,
          false,
          false,
          null,
          null,
          null,
          reviewAssignment.submission
        );
        await review.validateOrReject();
        await transactionalEntityManager.save(review);
      }
      // set the proper assignmentstate
      assignment.state = AssignmentState.REVIEW;
      await assignment.validateOrReject();
      await transactionalEntityManager.save(assignment);
    }
  );
  return `Distributed ${fullReviewDistribution.length} reviews for assignment ${assignment.id}`;
};

const getTotalNumberOfReviews = function (userNumberList: [User, number][]) {
  let totalNumberOfReviews = 0;
  for (const userNumber of userNumberList) {
    totalNumberOfReviews += userNumber[1];
  }
  return totalNumberOfReviews;
};

// Takes care of the distribution of reviews of submissions over the students
const generateReviewDistribution = async function (
  submissions: Submission[],
  userNumberList: [User, number][] // reviewing students
): Promise<reviewAssignment[]> {
  for (const userNumber of userNumberList) {
    const reviewsOfUser = userNumber[1];
    // basic validation
    if (reviewsOfUser < 1 || !Number.isInteger(reviewsOfUser)) {
      throw new Error("reviewsOfUser should be a positive integer");
    }
    // If there are less submissions than required to review per person, then no division can be made
    if (submissions.length < reviewsOfUser) {
      throw new Error(
        `There are not enough submissions to assign the required number of reviewsOfUser: ${reviewsOfUser}`
      );
    }
  }
  // If there are less reviews than submissions
  // then no division can be made as there will be submissions without reviews
  if (submissions.length > getTotalNumberOfReviews(userNumberList)) {
    throw new Error(
      "There are not enough reviews for the number of submissions"
    );
  }

  // findDistribution will try max 10 times to find a distribution (to avoid infinite loops)
  // it will throw an error if no solution is found
  const reviewDistribution = await findDistribution(
    submissions,
    userNumberList
  );
  return reviewDistribution;
};

const findDistribution = async function (
  submissions: Submission[],
  userNumberList: [User, number][]
) {
  // calculate ideal upper and lower bounds
  const totalNumberOfReviews = getTotalNumberOfReviews(userNumberList);
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
  const shuffledUserNumberList = _.shuffle(userNumberList);
  const shuffledSubmissions = _.shuffle(submissions);

  // initialize result and attemptcounter
  const maxAttempts = 10;
  let reviewDistribution = undefined;
  let counter = 0;
  // attempt 10 times to make a distribution
  while (!reviewDistribution && counter < maxAttempts) {
    reviewDistribution = await performMaxFlow(
      shuffledSubmissions,
      shuffledUserNumberList,
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
  userNumberList: [User, number][],
  minNumberOfReviewsPerSubmission: number,
  maxNumberOfReviewsPerSubmission: number
) {
  // k number of users
  const k = userNumberList.length;
  // n number of submissions
  const n = submissions.length;
  // total reviews
  const totalNumberOfReviews = getTotalNumberOfReviews(userNumberList);
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

  // 1 SOURCE edge for every user with capacity reviews of User
  for (let i = 0; i < k; i++) {
    const userNumber = userNumberList[i];
    graph.addEdge(
      new jsgraphs.FlowEdge(SOURCE, nodeNumberOfUserIndex(i), userNumber[1])
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
    const user = userNumberList[i][0];
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
      const user = userNumberList[userIndexOfNodeNumber(from)][0];
      const submission = submissions[submissionIndexOfNodeNumber(to)];
      const assignmentVersion = await submission.getAssignmentVersion();
      const submissionQuestionnaire = await assignmentVersion.getSubmissionQuestionnaire();
      if (!submissionQuestionnaire) {
        throw new Error("submissionQuestionnaire not found");
      }
      reviewDistribution.push({
        reviewer: user,
        submission: submission,
        submissionQuestionnaire: submissionQuestionnaire,
      });
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

const generateSelfReviews = async function (
  submissions: Submission[]
): Promise<reviewAssignment[]> {
  const selfReviewAssignments: reviewAssignment[] = [];
  for (const submission of submissions) {
    const assignmentVersion = await submission.getAssignmentVersion();
    const submissionQuestionnaire = await assignmentVersion.getSubmissionQuestionnaire();
    if (!submissionQuestionnaire) {
      throw new Error("submissionQuestionnaire not found");
    }
    const group = await submission.getGroup();
    const users = await group.getUsers();
    for (const user of users) {
      const selfReviewAssignment = {
        reviewer: user,
        submission: submission,
        submissionQuestionnaire: submissionQuestionnaire,
      };
      selfReviewAssignments.push(selfReviewAssignment);
    }
  }
  return selfReviewAssignments;
};

const distributeReviewsForAssignment = async function (
  assignmentId: number
): Promise<string> {
  await ensureConnection();
  const assignment = await Assignment.findOneOrFail(assignmentId);
  try {
    const result = await distributeReviewsForAssignmentHelper(assignment);
    await sendMailToTeachersOfAssignment(
      "Distributed reviews for assignment",
      result,
      assignment
    );
    return result;
  } catch (error) {
    await sendMailToTeachersOfAssignment(
      "Error while distributing reviews for assignment",
      String(error),
      assignment
    );
    throw error;
  }
};

export { distributeReviewsForAssignment, generateReviewDistribution };
