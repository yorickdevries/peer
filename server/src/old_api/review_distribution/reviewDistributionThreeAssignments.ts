import SubmissionsPS from "../prepared_statements/submissions_ps";
import GroupsPS from "../prepared_statements/group_ps";
import AssignmentPS from "../prepared_statements/assignment_ps";
import ReviewPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import GroupParser from "../groupParser";

/**
 * Class which takes care of the distribution of all reviews over the students across THREE assignments
 * Here we have 3 assignments: A, B, and C.
 * The students of 1 assignment review only the other 2 assignments with a fixed number of reviews.
 * So a student from assignment A reviews x submissions from B and x submissions from C. Total reviews for this student: 2x
 */
export default class ReviewDistributionThreeAssignments {

    /**
     * Distribute reviews for three specific assignments
     */
    public static async distributeReviews(assignmentId1: number, assignmentId2: number, assignmentId3: number, reviewsPerUserPerOtherAssignment: number) {
        // check for duplicates
        if (assignmentId1 == assignmentId2 || (assignmentId1 == assignmentId3) || (assignmentId2 == assignmentId3)) {
            throw new Error("Three distinct assignments are required");
        }

        // Check for a rubric entry for all assignments
        const rubricExists1: any = await RubricPS.executeExistsSubmissionRubricByAssignmentId(assignmentId1);
        const rubricExists2: any = await RubricPS.executeExistsSubmissionRubricByAssignmentId(assignmentId2);
        const rubricExists3: any = await RubricPS.executeExistsSubmissionRubricByAssignmentId(assignmentId3);
        if (!rubricExists1.exists || !rubricExists2.exists || !rubricExists3.exists) {
            throw new Error("No rubric is present for at least one of the assignments");
        }

        const assignment1 = await AssignmentPS.executeGetAssignmentById(assignmentId1);
        const assignment2 = await AssignmentPS.executeGetAssignmentById(assignmentId2);
        const assignment3 = await AssignmentPS.executeGetAssignmentById(assignmentId3);
        // check whether the assignments are due
        if (new Date(assignment1.due_date) > new Date() || new Date(assignment2.due_date) > new Date() || new Date(assignment3.due_date) > new Date()) {
            throw new Error("At least one of the assignments isn't due yet");
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
            reviews = await this.assignSubmissionstoUsers(assignmentId1, assignmentId2, assignmentId3, reviewsPerUserPerOtherAssignment);
            counter++;
        }

        // check for existing reviews
        const existingReviews1: any = await ReviewPS.executeGetSubmissionReviewsByAssignmentId(assignmentId1);
        const existingReviews2: any = await ReviewPS.executeGetSubmissionReviewsByAssignmentId(assignmentId2);
        const existingReviews3: any = await ReviewPS.executeGetSubmissionReviewsByAssignmentId(assignmentId3);
        if (existingReviews1.length !== 0 || existingReviews2.length !== 0 || existingReviews3.length !== 0) {
            throw new Error("There are already reviews assigned for at least one of the assignments");
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
    public static async assignSubmissionstoUsers(assignmentId1: number, assignmentId2: number, assignmentId3: number, reviewsPerUserPerOtherAssignment: number) {
        // Get the latest versions of all submissions per group
        const allSubmissions1: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId1);
        const allSubmissions2: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId2);
        const allSubmissions3: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId3);

        // When there are assignments with too less submissions, then no division can be made
        if (allSubmissions1.length < reviewsPerUserPerOtherAssignment || allSubmissions2.length < reviewsPerUserPerOtherAssignment || allSubmissions3.length < reviewsPerUserPerOtherAssignment) {
            throw new Error("There are not enough submissions for one of the assignments");
        }

        // userlists, just netids in a list
        const allUsers1 = await this.allUsersOfSubmissions(allSubmissions1);
        const allUsers2 = await this.allUsersOfSubmissions(allSubmissions2);
        const allUsers3 = await this.allUsersOfSubmissions(allSubmissions3);

        // assign reviews
        const reviews: any[] = [];

        // start with distributing for assignment 1
        try {
            await this.assignReviews(allUsers2.concat(allUsers3), allSubmissions1, reviewsPerUserPerOtherAssignment, reviews);
            // start with distributing for assignment 2
            await this.assignReviews(allUsers1.concat(allUsers3), allSubmissions2, reviewsPerUserPerOtherAssignment, reviews);
            // start with distributing for assignment 3
            await this.assignReviews(allUsers1.concat(allUsers2), allSubmissions3, reviewsPerUserPerOtherAssignment, reviews);
            return reviews;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * Gets all users of a set of submissions
     */
    public static async allUsersOfSubmissions(submissions: any[]) {
        const allUsers = [];
        // iterate over all submissions
        // to get all the users connected to submissions
        for (const submission of submissions) {
            const groupId = submission.group_id;
            // iterate over all the users in this submission
            const users: any = await GroupsPS.executeGetUsersOfGroupById(groupId);
            // Assign submissions to every user
            for (const user of users) {
                allUsers.push(user.user_netid);
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
    public static async makeCountList(currentnetId: string | undefined, submissions: any[], reviews: any[]) {
        // make a list of all other submissions
        const otherSubmissions = [];
        for (const submission of submissions) {
            // Check whether the current user is in the group of this submission
            const submissionGroupUsers: any = await GroupsPS.executeGetUsersOfGroupById(submission.group_id);
            let currentNetIdInGroup = false;
            for (const groupUser of submissionGroupUsers) {
                const userNetId = groupUser.user_netid;
                if (currentnetId == userNetId) {
                    currentNetIdInGroup = true;
                }
            }
            // skip the current submission if the user is the same group or if the user already reviews this submission
            if (!currentNetIdInGroup && !this.reviewsSubmission(currentnetId, submission.id, reviews)) {
                const count = this.countReviews(submission.id, reviews);
                const submissionCount = {submission: submission, count: count};
                otherSubmissions.push(submissionCount);
            }
        }
        return otherSubmissions;
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
    public static async assignReviews(users: any[], submissions: any[], reviewsPerUser: number, reviews: any[]) {
        // Shuffle all the users
        this.shuffle(users);
        // make a certain amount of reviews per user
        for (let k = 0; k < reviewsPerUser; k++) {
            for (const userNetId of users) {
                // make a list of all potential submissions
                const otherSubmissions = await this.makeCountList(userNetId, submissions, reviews);
                // when no submission can be picked, throw an error
                if (otherSubmissions.length == 0) {
                    throw new Error("Review distribution is not possible");
                }
                // Shuffle all the submissions
                this.shuffle(otherSubmissions);
                // Sort the submissions based on reviewcount
                // Entries with the same reviewcount remain shuffled relative to eachother
                this.sortSubmissionCount(otherSubmissions);
                // Get the first submission of the list
                const submission = otherSubmissions[0].submission;
                // Add reviews to result list
                const review = {userNetId: userNetId, submissionId: submission.id};
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