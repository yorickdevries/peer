<template>
    <div>
        <b-card v-if="reviews.length === 0">No reviews available.</b-card>
        <div v-else>
            <b-alert variant="info" :show="assignment.state === 'feedback' && isReviewActive"
                >The review phase has passed, make sure to submit your reviews as soon as possible.</b-alert
            >
            <b-alert variant="danger" :show="assignment.state === 'feedback' && !isReviewActive"
                >The review phase has passed, you are not allowed to change any review anymore</b-alert
            >
            <b-card no-body>
                <b-tabs card>
                    <b-tab v-for="review in reviews" :key="review.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2">ID: {{ review.id }}</b-badge>
                                <b-badge v-if="review.submitted" variant="success" class="mr-2">DONE</b-badge>
                                <b-badge v-if="!review.submitted" variant="danger" class="mr-2">DUE</b-badge>
                            </div>
                        </template>
                        <Review
                            :reviewId="review.id"
                            @reviewChanged="fetchReviews"
                            :reviewsAreReadOnly="!isReviewActive"
                        ></Review>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import Review from "./Review"
import api from "../../../api/api"

export default {
    components: {
        Review
    },
    data() {
        return {
            assignment: {},
            reviews: []
        }
    },
    computed: {
        isReviewActive() {
            return (
                // either late submission must be enabled or the due date should not have been passed
                this.assignment.lateSubmissionReviews || new Date() < new Date(this.assignment.reviewDueDate)
            )
        }
    },
    async created() {
        await this.fetchAssignment()
        await this.fetchReviews()
    },
    methods: {
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchReviews() {
            const res = await api.submissionquestionnaires.getReviews(this.assignment.submissionQuestionnaireId)
            this.reviews = res.data
        }
    }
}
</script>
