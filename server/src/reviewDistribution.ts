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
            let reviews = undefined;
            // Calculate a solution until a valid solution is found or an error is thrown
            while (reviews == undefined) {
                console.log("Assigning reviews:");
                reviews = await this.assignUsersToSubmissions(assignmentId);
                console.log("Reviews: " + JSON.stringify(reviews));
            }
            // Adding to database
            for (const review of reviews) {
                await ReviewPS.executeCreateReview("", review.userNetId, review.submissionId, assignmentId);
            }
            return reviews;
        } catch (err) {
            return {error: err.message};
        }
    }

    public static async assignUsersToSubmissions(assignmentId: number) {
        const assignment: any = await AssignmentPS.executeGetAssignmentById(assignmentId);
        const reviewsPerUser = assignment.reviews_per_user;
        console.log("reviews per User: " + reviewsPerUser);
        // Get the latest versions of all submissions
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
        // If there are less users than submissions
        // then no division can be made
        if (allSubmissions.length > allUsers.length) {
            throw new Error("There are not enough users for the amount of submissions");
        }
        // Shuffle all the users
        this.shuffle(allUsers);
        // make a certain amount of reviews per user
        for (let k = 0; k < reviewsPerUser; k++) {
            for (const user of allUsers) {
                const groupId = user.groupId;
                // make a list of all other submissions
                const otherSubmissions = this.makeCountList(groupId, allSubmissions, reviews);
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
        const submissionCount = this.makeCountList(undefined, allSubmissions, reviews);
        // sort submissions from low to high
        this.sortSubmissionCount(submissionCount);
        // In case there is a submission without assignment
        if (submissionCount[0].count == 0) {
            return undefined;
        } else {
            return reviews;
        }
    }

    // Counts the amount of assigned reviews
    public static countReviews(submissionId: number, reviews: any[]) {
        let count = 0;
        for (const review of reviews) {
            if (review.submissionId == submissionId) {
                count++;
            }
        }
        return count;
    }

    // Makes a list of reviewcounts
    public static makeCountList(currentGroupId: number | undefined, submissions: any[], reviews: any[]) {
        // make a list of all other submissions
        const otherSubmissions = [];
        for (const submission of submissions) {
            // skip the current submission
            if (submission.group_id !== currentGroupId) {
                const count = this.countReviews(submission.id, reviews);
                const submissionCount = {submission: submission, count: count};
                otherSubmissions.push(submissionCount);
            }
        }
        return otherSubmissions;
    }

    // sorts submissions based on the submissioncount
    public static sortSubmissionCount(submissions: any[]) {
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