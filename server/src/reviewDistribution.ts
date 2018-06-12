import SubmissionsPS from "./prepared_statements/submissions_ps";
import GroupsPS from "./prepared_statements/group_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import ReviewPS from "./prepared_statements/review_ps";
import RubricPS from "./prepared_statements/rubric_ps";

/**
 * Class which takes care of the distribution of all reviews over the students
 *
 * @export
 * @class ReviewDistribution
 */
export default class ReviewDistribution {
    /**
     * Distribute reviews for a specific assignment
     */
    public static async distributeReviews(assignmentId: number) {
        // Distribution of reviews for assignment
        // Check for a rubric entry
        const rubricExists: any = await RubricPS.executeExistsRubricByAssignmentId(assignmentId);
        if (!rubricExists.exists) {
            throw new Error("No rubric is present for this assignment");
        }
        let reviews = undefined;
        // Calculate a solution until a valid solution is found or an error is thrown
        while (reviews == undefined) {
            // Assigning reviews
            reviews = await this.assignSubmissionstoUsers(assignmentId);
        }
        // Add the review assignments to the database
        for (const review of reviews) {
            await ReviewPS.executeCreateReview(review.userNetId, review.submissionId, assignmentId);
        }
        // Return a list of made reviews
        return reviews;
    }

    /**
     * This methods assigns reviews for a specific assignment
     *
     * @static
     * @param {number} assignmentId
     * @returns
     * @memberof ReviewDistribution
     */
    public static async assignSubmissionstoUsers(assignmentId: number) {
        const assignment: any = await AssignmentPS.executeGetAssignmentById(assignmentId);
        const reviewsPerUser = assignment.reviews_per_user;
        // Get the latest versions of all submissions per group
        const allSubmissions: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId);
        // If there are less submissions than required
        // to review per person, then no division can be made
        if (allSubmissions.length - 1 < reviewsPerUser) {
            throw new Error("There are not enough submissions to assign the required amount of reviewsPerUser: " + reviewsPerUser);
        }
        // Result object which keeps track to all review assignments
        const reviews = [];
        // user tuple list
        const allUsers = [];
        // iterate over all submissions
        // to get all the users connected to submissions
        for (const submission of allSubmissions) {
            const groupId = submission.group_id;
            // iterate over all the users in this submission
            const users: any = await GroupsPS.executeGetUsersOfGroupById(groupId);
            // Assign submissions to every user
            for (const user of users) {
                const userNetId = user.user_netid;
                const userGroup = {userNetId: userNetId, groupId: groupId};
                allUsers.push(userGroup);
            }
        }
        // If there are less users * reviews per user than submissions
        // then no division can be made
        if (allSubmissions.length > (allUsers.length * reviewsPerUser)) {
            throw new Error("There are not enough users for the amount of submissions");
        }
        // Shuffle all the users
        this.shuffle(allUsers);
        // make a certain amount of reviews per user
        for (let k = 0; k < reviewsPerUser; k++) {
            for (const user of allUsers) {
                // make a list of all potential submissions
                const otherSubmissions = this.makeCountList(user.userNetId, user.groupId, allSubmissions, reviews);
                // Shuffle all the submissions
                this.shuffle(otherSubmissions);
                // Sort the submissions based on reviewcount
                // Entries with the same reviewcount remain shuffled relative to eachother
                this.sortSubmissionCount(otherSubmissions);
                // Get the first submission of the list
                const submission = otherSubmissions[0].submission;
                // Add reviews to result list
                const review = {userNetId: user.userNetId, submissionId: submission.id};
                reviews.push(review);
            }
        }
        // make a submissionCount of all submissions
        const submissionCount = this.makeCountList(undefined, undefined, allSubmissions, reviews);
        // sort submissions from low to high
        this.sortSubmissionCount(submissionCount);
        // In case there is a submission without assignment return undefined
        if (submissionCount[0].count == 0) {
            return undefined;
        } else {
            return reviews;
        }
    }

    /**
     * Counts the amount of assigned reviews to a certain submission
     *
     * @static
     * @param {number} submissionId
     * @param {any[]} reviews
     * @returns
     * @memberof ReviewDistribution
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
     *
     * @static
     * @param {(string | undefined)} netId
     * @param {number} submissionId
     * @param {any[]} reviews
     * @returns
     * @memberof ReviewDistribution
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
     *
     * @static
     * @param {(string | undefined)} currentnetId
     * @param {(number | undefined)} currentGroupId
     * @param {any[]} submissions
     * @param {any[]} reviews
     * @returns
     * @memberof ReviewDistribution
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
     * Sorts submissions based on the submissioncount
     *
     * @static
     * @param {any[]} submissions
     * @returns
     * @memberof ReviewDistribution
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