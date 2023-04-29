<template>
    <div>
        <b-card v-if="reviews.length === 0">No reviews available.</b-card>
        <div v-else>
            <b-alert variant="info" :show="assignment.state === 'feedback' && isReviewActive"
                >The review phase has passed, make sure to submit your reviews as soon as possible.</b-alert
            >
            <b-alert variant="warning" :show="!assignment.lateSubmissionReviews && isReviewActive"
                >Reviews have a hard deadline, make sure to submit your reviews on time.</b-alert
            >
            <b-alert variant="danger" :show="!isReviewActive"
                >The review deadline has passed, you are not allowed to change any review anymore.</b-alert
            >
            <b-card no-body>
                <b-tabs card>
                    <b-tab v-for="(review, index) in reviews" :key="review.id">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge variant="warning" class="mr-2">Review #{{ index + 1 }}</b-badge>
                                <b-badge v-if="review.submitted" variant="success" class="mr-2">DONE</b-badge>
                                <b-badge v-if="!review.submitted" variant="danger" class="mr-2">DUE</b-badge>
                            </div>
                        </template>
                        <Review
                            :ref="'review-' + index"
                            :reviewId="review.id"
                            @reviewChanged="fetchReviews"
                            :reviewsAreReadOnly="!isReviewActive"
                            :assignmentType="assignment.assignmentType"
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
        Review,
    },
    data() {
        return {
            assignment: {},
            reviews: [],
        }
    },
    computed: {
        isReviewActive() {
            return (
                // either late submission must be enabled or the due date should not have been passed
                this.assignment.lateSubmissionReviews || new Date() < new Date(this.assignment.reviewDueDate)
            )
        },
    },
    beforeRouteLeave(to, from, next) {
        // If the form is dirty and the user did not confirm leave,
        // prevent losing unsaved changes by canceling navigation
        if (this.confirmStayInDirtyForm()) {
            next(false)
        } else {
            // Navigate to next view
            next()
        }
    },
    async created() {
        window.addEventListener("beforeunload", this.beforeWindowUnload)
        await this.fetchAssignment()
        await this.fetchReviews()
    },
    beforeDestroy() {
        window.removeEventListener("beforeunload", this.beforeWindowUnload)
    },
    methods: {
        confirmLeave() {
            return window.confirm("Do you really want to leave? You still have unsaved changes.")
        },
        isFormDirty() {
            for (let i = 0; i < this.reviews.length; i++) {
                if (this.$refs[`review-${i}`][0].numberOfUnsavedQuestions() !== 0) {
                    return true
                }
            }
            return false
        },
        confirmStayInDirtyForm() {
            return this.isFormDirty() && !this.confirmLeave()
        },

        beforeWindowUnload(e) {
            if (this.confirmStayInDirtyForm()) {
                // Cancel the event
                e.preventDefault()
                // Chrome requires returnValue to be set
                e.returnValue = ""
            }
        },
        async fetchAssignment() {
            const res = await api.assignments.get(this.$route.params.assignmentId)
            this.assignment = res.data
        },
        async fetchReviews() {
            const reviews = []
            for (const assignmentVersion of this.assignment.versions) {
                const res = await api.submissionquestionnaires.getReviews(assignmentVersion.submissionQuestionnaireId)
                reviews.push(...res.data)
            }
            this.reviews = reviews
        },
    },
}
</script>
