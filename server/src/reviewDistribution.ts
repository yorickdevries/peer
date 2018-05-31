import SubmissionsPS from "./prepared_statements/submissions_ps";
import GroupsPS from "./prepared_statements/group_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import ReviewPS from "./prepared_statements/review_ps";

export default class ReviewDistribution {
    /**
     * Distribute reviews
     */
    public static async distributeReviews(assignmentId: number) {
        // make a rubric entry
        console.log("Distribution of reviews for assignment " + assignmentId);
        try {
            const assignment: any = await AssignmentPS.executeGetAssignmentById(assignmentId);
            const reviewsPerUser = assignment.reviews_per_user;
            console.log("reviewsPerUser: " + reviewsPerUser);
            const submissions: any = await SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(assignmentId);
            console.log(submissions);
            // if there are less submssions than required to rview per person
            // no division can be made
            if (submissions.length < reviewsPerUser + 1) {
                throw new Error("There are not enough submissions to assign the required amount of reviewsPerUser: " + reviewsPerUser);
            }
            let result: any[] = [];
            for (let i = 0; i < submissions.length; i++) {
                const thisSubmission = submissions[i];
                const nextSubmission = submissions[(i + 1) % submissions.length];
                const reviews = await this.GenerateReviews(thisSubmission.group_id, nextSubmission.id, assignmentId);
                // Add reviews to result list
                result = result.concat(reviews);
            }
            return result;
        } catch (err) {
            return {error: err.message};
        }
    }

    // assigns every member of a group to a review of a certain submission
    public static async GenerateReviews(groupId: number, submissionId: number, rubricId: number) {
        const result = [];
        // All users
        const users: any = await GroupsPS.executeGetUsersOfGroupById(groupId);
        // Assign a submission to every user
        for (let i = 0; i < users.length; i++) {
            const thisUser = users[i];
            const review = await ReviewPS.executeCreateReview(undefined, thisUser.user_netid, submissionId, rubricId);
            result.push(review);
        }
        return result;
    }

}