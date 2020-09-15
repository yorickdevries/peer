<template>
    <div>
        <b-card v-if="feedbackReviews.length === 0">No reviews available.</b-card>
        <div v-else>
            <b-card no-body>
                <b-tabs card>
                    <b-tab v-for="review in feedbackReviews" :key="review.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2">ID: {{ review.id }}</b-badge>
                                <b-badge v-if="review.evaluationDone" variant="success" class="mr-2">DONE</b-badge>
                                <b-badge v-if="!review.evaluationDone" variant="danger" class="mr-2">DUE</b-badge>
                            </div>
                        </template>
                        <ReviewEvaluation
                            :feedbackReviewId="review.id"
                            :reviewEvaluationsAreReadOnly="!isReviewEvaluationActive"
                        ></ReviewEvaluation>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import api from "../../../api/api"
import ReviewEvaluation from "./ReviewEvaluation"

export default {
    components: { ReviewEvaluation },
    data() {
        return {
            assignment: {},
            group: null,
            finalSubmission: null,
            feedbackReviews: []
        }
    },
    computed: {
        isReviewEvaluationActive() {
            return (
                this.assignment.lateReviewEvaluations || new Date() < new Date(this.assignment.reviewEvaluationDueDate)
            )
        }
    },
    async created() {
        await this.fetchData()
    },
    methods: {
        async fetchData() {
            await this.fetchAssignment()
            await this.fetchGroup()
            await this.fetchFinalSubmission()
            await this.fetchFeedbackReviews()
        },
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchGroup() {
            // Fetch the group information.
            const res = await api.assignments.getGroup(this.$route.params.assignmentId)
            this.group = res.data
        },
        async fetchFinalSubmission() {
            // Fetch the submission.
            const res = await api.assignments.getFinalSubmission(this.$route.params.assignmentId, this.group.id)
            this.finalSubmission = res.data
        },
        async fetchFeedbackReviews() {
            const res = await api.submissions.getFeedback(this.finalSubmission.id)
            const reviews = res.data

            for (const review of reviews) {
                // Retrieve the review evaluation.
                try {
                    const res = await api.reviewofsubmissions.getEvaluation(review.id)
                    const evaluation = res.data
                    review.evaluationDone = evaluation.submitted
                } catch (error) {
                    review.evaluationDone = false
                }
            }
            this.feedbackReviews = reviews
        }
    }
}
</script>
