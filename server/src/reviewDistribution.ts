import SubmissionsPS from "./prepared_statements/submissions_ps";
import GroupsPS from "./prepared_statements/group_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import ReviewPS from "./prepared_statements/review_ps";

export default class ReviewDistribution {
    /**
     * Distribute reviews for a specific assignment
     */
    public static async distributeReviews(assignmentId: number) {
        // Check for a rubric entry!!!
        console.log("Distribution of reviews for assignment " + assignmentId);
        try {
            const assignment: any = await AssignmentPS.executeGetAssignmentById(assignmentId);
            const reviewsPerUser = assignment.reviews_per_user;
            console.log("reviews per User: " + reviewsPerUser);
            // Get the latest versions of all submissions
            const submissions: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId);
            // If there are less submissions than required
            // to review per person, then no division can be made
            if (submissions.length - 1 < reviewsPerUser) {
                throw new Error("There are not enough submissions to assign the required amount of reviewsPerUser: " + reviewsPerUser);
            }
            // Result object which keeps track to all review assignments
            const reviews = [];
            // iterate over all submissions
            for (let i = 0; i < submissions.length; i++) {
                const thisSubmission = submissions[i];
                // iterate over all the users in this submission
                const users: any = await GroupsPS.executeGetUsersOfGroupById(thisSubmission.group_id);
                // Assign submissions to every user
                for (let j = 0; j < users.length; j++) {
                    const thisUser = users[j];
                    // make a certain amount of reviews for every user from thisSubmission
                    for (let k = 0; k < reviewsPerUser; k++) {
                        // make a list of all other submissions
                        const otherSubmissions = this.makeCountList(i, submissions, reviews);
                        // Shuffle all the submissions
                        this.shuffle(otherSubmissions);
                        // Sort the submissions based on reviewcount
                        // Entries with the same reviewcount remain shuffled relative to eachother
                        this.sortSubmissionCount(otherSubmissions);
                        // Get the first of the list
                        const submission = otherSubmissions[0].submission;
                        // Add reviews to result list
                        const review = await ReviewPS.executeCreateReview("", thisUser.user_netid, submission.id, assignmentId);
                        reviews.push(review);
                    }
                }
            }
            return reviews;
        } catch (err) {
            return {error: err.message};
        }
    }

    // Counts the amount of assigned reviews
    public static countReviews(submissionId: number, reviews: any[]) {
        let count = 0;
        for (const review of reviews) {
            if (review.submission_id == submissionId) {
                count++;
            }
        }
        return count;
    }

    // Makes a list of reviewcounts
    public static makeCountList(currentIndex: number, submissions: any[], reviews: any[]) {
        // make a list of all other submissions
        const otherSubmissions = [];
        for (let i = 0; i < submissions.length; i++) {
            // skip the current submission
            if (i !== currentIndex) {
                const submission = submissions[i];
                const count = this.countReviews(submission.id, reviews);
                const submissionCount = {submission: submission, count: count};
                otherSubmissions.push(submissionCount);
            }
        }
        return otherSubmissions;
    }

    // sorts submissions
    public static sortSubmissionCount(submissions: any[]) {
        // sort otherSubmissions
        // sort function
        function compare(a: any, b: any) {
            if (a.count < b.count)
                return -1;
            if (a.count > b.count)
                return 1;
            return 0;
        }
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