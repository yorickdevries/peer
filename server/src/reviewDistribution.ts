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
        const submissions: any = await SubmissionsPS.executeGetSubmissionsByAssignmentId(assignmentId);
        let result: any[] = [];
        for (let i = 0; i < submissions.length; i++) {
            const thisSubmission = submissions[i];
            const nextSubmission = submissions[(i + 1) % submissions.length];
            const reviews = await this.GenerateReviews(thisSubmission.group_id, nextSubmission.id, assignmentId);
            // Add reviews to result list
            result = result.concat(reviews);
        }
        return result;
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