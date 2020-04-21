import SubmissionsPS from "./prepared_statements/submissions_ps";
import GroupsPS from "./prepared_statements/group_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import ReviewPS from "./prepared_statements/review_ps";
import RubricPS from "./prepared_statements/rubric_ps";
import GroupParser from "./groupParser";

/**
 * Class which takes care of the distribution of all reviews over the students across TWO assignments
 * What happens here is that all students from Assignment A review as much of students from Assignment B and vice versa
 */
export default class ReviewDistributionTwoAssignments {

    /**
     * Distribute reviews for two specific assignments
     */
    public static async distributeReviews(assignmentId1: number, assignmentId2: number, reviewsPerUser: number) {
        if (assignmentId1 == assignmentId2) {
            throw new Error("Two distinct assignments are required");
        }

        // Check for a rubric entry for both assignments
        const rubricExists1: any = await RubricPS.executeExistsSubmissionRubricByAssignmentId(assignmentId1);
        const rubricExists2: any = await RubricPS.executeExistsSubmissionRubricByAssignmentId(assignmentId2);
        if (!rubricExists1.exists || !rubricExists2.exists) {
            throw new Error("No rubric is present for one of the assignments");
        }

        const assignment1 = await AssignmentPS.executeGetAssignmentById(assignmentId1);
        const assignment2 = await AssignmentPS.executeGetAssignmentById(assignmentId2);
        // check whether the assignments are due
        if (new Date(assignment1.due_date) > new Date() || new Date(assignment2.due_date) > new Date()) {
            throw new Error("One or both of the assignments isn't due yet");
        }

        // Distribution of reviews for assignment
        let reviews = undefined;
        // Calculate a solution until a valid solution is found or an error is thrown
        let counter = 0;
        while (reviews == undefined) {
            if (counter >= 10) {
                throw new Error("No suitable distribution can be found after 10 tries");
            }
            // Assigning reviews
            reviews = await this.assignSubmissionstoUsers(assignmentId1, assignmentId2, reviewsPerUser);
            counter++;
        }

        const existingReviews1: any = await ReviewPS.executeGetSubmissionReviewsByAssignmentId(assignmentId1);
        const existingReviews2: any = await ReviewPS.executeGetSubmissionReviewsByAssignmentId(assignmentId2);
        if (existingReviews1.length !== 0 || existingReviews2.length !== 0) {
            throw new Error("There are already reviews assigned for one or both assignments");
        }

        // Add the review assignments to the database
        for (const review of reviews) {
            const submission: any = await SubmissionsPS.executeGetSubmissionById(review.submissionId);
            const rubric: any = await RubricPS.executeGetSubmissionRubricByAssignmentId(submission.assignment_id);

            await ReviewPS.executeCreateReview(review.userNetId, review.submissionId, rubric.id);
            // enroll in assignment if not already
            const studentIsInGroup = await GroupParser.studentIsInGroup(review.userNetId, submission.assignment_id);
            if (!studentIsInGroup) {
                // Create group and add assignment and student.
                const groupId = await GroupParser.createGroupForAssignment(review.userNetId, submission.assignment_id);
                await GroupsPS.executeAddStudenttoGroup(review.userNetId, groupId);
            }
        }
        // Return a list of made reviews
        return reviews;
    }

    /**
     * This methods assigns reviews to users
     */
    public static async assignSubmissionstoUsers(assignmentId1: number, assignmentId2: number, reviewsPerUser: number) {
        // Get the latest versions of all submissions per group
        const allSubmissions1: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId1);
        const allSubmissions2: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId2);

        // List of all submissions
        const allSubmissions = [];
        for (const submission of allSubmissions1) {
            allSubmissions.push(submission);
        }
        for (const submission of allSubmissions2) {
            allSubmissions.push(submission);
        }

        // When there are less submissions than required to review per person, then no division can be made
        if (allSubmissions1.length + allSubmissions2.length - 1 < reviewsPerUser) {
            throw new Error("There are not enough submissions to assign the required amount of reviewsPerUser: " + reviewsPerUser);
        }

        // user tuple list, including assignment number
        const allUsers1 = await this.allUsersOfSubmissions(allSubmissions1, assignmentId1);
        const allUsers2 = await this.allUsersOfSubmissions(allSubmissions2, assignmentId2);

        // If there are less users * reviews per user than submissions
        // then no division can be made
        if ((allSubmissions1.length + allSubmissions2.length) > ((allUsers1.length + allUsers2.length) * reviewsPerUser)) {
            throw new Error("There are not enough users for the number of submissions");
        }
        // calculate the minimum number of reviews per submission
        const minimalNumberOfReviewsPerSubmission =
            Math.floor(
            ((allUsers1.length + allUsers2.length) * reviewsPerUser)
            /
            (allSubmissions1.length + allSubmissions2.length)
            );

        // Reviewers from A2 for submissions of A1
        const numberOfReviewsPerSubmission1 =
            (allUsers2.length * reviewsPerUser)
            /
            (allSubmissions1.length);
        // Reviewers from A1 for submissions of A2
        const numberOfReviewsPerSubmission2 =
            (allUsers1.length * reviewsPerUser)
            /
            (allSubmissions2.length);

        // assign reviews
        const reviews: any[] = [];
        if (numberOfReviewsPerSubmission1 <= numberOfReviewsPerSubmission2) {
            // start with distributing for assignment 1
            this.assignReviews(allUsers2, allSubmissions1, reviewsPerUser, reviews);
            // then distribute the remaining reviews of allUsers1 over all submissions
            this.assignReviews(allUsers1, allSubmissions, reviewsPerUser, reviews);
        } else {
            // start with distributing for assignment 2
            this.assignReviews(allUsers1, allSubmissions2, reviewsPerUser, reviews);
            // then distribute the remaining reviews of allUsers2 over all submissions
            this.assignReviews(allUsers2, allSubmissions, reviewsPerUser, reviews);
        }

        // Check afterwards for valid distribution
        // make a submissionCount of all submissions
        const submissionCount = this.makeCountList(undefined, undefined, allSubmissions, reviews);
        // sort submissions from low to high
        this.sortSubmissionCount(submissionCount);
        // In case there is a submission without assignment return undefined and try again
        if (submissionCount[0].count < minimalNumberOfReviewsPerSubmission) {
            return undefined;
        } else {
            return reviews;
        }
    }

    /**
     * Gets all users of a set of submissions
     */
    public static async allUsersOfSubmissions(submissions: any[], assignmentId: number) {
        // user tuple list
        const allUsers = [];
        // iterate over all submissions
        // to get all the users connected to submissions
        for (const submission of submissions) {
            const groupId = submission.group_id;
            // iterate over all the users in this submission
            const users: any = await GroupsPS.executeGetUsersOfGroupById(groupId);
            // Assign submissions to every user
            for (const user of users) {
                const userNetId = user.user_netid;
                const userGroup = {userNetId: userNetId, groupId: groupId, assignmentId: assignmentId};
                allUsers.push(userGroup);
            }
        }
        return allUsers;
    }

    /**
     * Counts the number of assigned reviews to a certain submission
     * @param {number} submissionId
     * @param {any[]} reviews
     * @returns
     */
    public static countReviews(submissionId: number, reviews: any[]) {
        let count = 0;
        for (const review of reviews) {
            if (review.submissionId == submissionId) {
                count++;
            }
        }
        return count;
    }

    /**
     * Checks whether this user already reviews this submission
     * @param {(string | undefined)} netId
     * @param {number} submissionId
     * @param {any[]} reviews
     * @returns
     */
    public static reviewsSubmission(netId: string | undefined, submissionId: number, reviews: any[]) {
        for (const review of reviews) {
            if (review.userNetId == netId && review.submissionId == submissionId) {
                return true;
            }
        }
        return false;
    }

    /**
     * Makes a list of reviewcounts
     * this method makes sure that the list doesnt include the already assigned submissions to this user
     * @param {(string | undefined)} currentnetId
     * @param {(number | undefined)} currentGroupId
     * @param {any[]} submissions
     * @param {any[]} reviews
     * @returns
     */
    public static makeCountList(currentnetId: string | undefined, currentGroupId: number | undefined, submissions: any[], reviews: any[]) {
        // make a list of all other submissions
        const otherSubmissions = [];
        for (const submission of submissions) {
            // skip the current submission if the user is the same group or if the user already reviews this submission
            if (submission.group_id !== currentGroupId && !this.reviewsSubmission(currentnetId, submission.id, reviews)) {
                const count = this.countReviews(submission.id, reviews);
                const submissionCount = {submission: submission, count: count};
                otherSubmissions.push(submissionCount);
            }
        }
        return otherSubmissions;
    }

    /**
     * Sorts submissions based on the submissioncount.
     * in case both have the same number of submissions, the entries with the other assignmentID will have priority
     * putting the specified assignmentId last in the list
     * @param {any[]} submissions
     * @returns
     */
    public static sortSubmissionAssignmentIdCount(submissions: any[], assignmentId: number) {
        const compare = function(a: any, b: any) {
            if (a.count < b.count)
                return -1;
            if (a.count > b.count)
                return 1;
            else {
                if (a.submission.assignment_id !== assignmentId && b.submission.assignment_id == assignmentId)
                    return -1;
                if (a.submission.assignment_id == assignmentId && b.submission.assignment_id !== assignmentId)
                    return 1;
                return 0;
            }
        };
        submissions.sort(compare);
        return;
    }

    /**
     * Sorts submissions based on the submissioncount
     * @param {any[]} submissions
     * @returns
     */
    public static sortSubmissionCount(submissions: any[]) {
        const compare = function(a: any, b: any) {
            if (a.count < b.count)
                return -1;
            if (a.count > b.count)
                return 1;
            return 0;
        };
        submissions.sort(compare);
        return;
    }

    /**
     * Assign reviews
     */
    public static assignReviews(users: any[], submissions: any[], reviewsPerUser: number, reviews: any[]) {
        // Shuffle all the users
        this.shuffle(users);
        // make a certain amount of reviews per user
        for (let k = 0; k < reviewsPerUser; k++) {
            for (const user of users) {
                // make a list of all potential submissions
                const otherSubmissions = this.makeCountList(user.userNetId, user.groupId, submissions, reviews);
                // Shuffle all the submissions
                this.shuffle(otherSubmissions);
                // Sort the submissions based on reviewcount
                // Sort entries based on the assignmentId, putting the assignments unequal to the user assignment first
                // Entries with the same reviewcount/assignmentid remain shuffled relative to eachother
                this.sortSubmissionAssignmentIdCount(otherSubmissions, user.assignmentId);
                // Get the first submission of the list
                const submission = otherSubmissions[0].submission;
                // Add reviews to result list
                const review = {userNetId: user.userNetId, submissionId: submission.id};
                reviews.push(review);
            }
        }
        return reviews;
    }

    /**
     * Shuffles array in place. ES6 version
     * source: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
     * @param {Array} a items An array containing the items.
     */
    public static shuffle(a: any[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

}