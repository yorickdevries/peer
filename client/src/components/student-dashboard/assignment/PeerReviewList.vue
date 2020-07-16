<template>
    <div>
        <b-card v-if="noReviews">No reviews available.</b-card>

        <div v-else>
            <b-alert variant="info" :show="readOnly"
                >The review due date has passed, you can only view your response(s).</b-alert
            >

            <b-card no-body>
                <b-tabs card>
                    <b-tab v-for="(review, index) in reviews" :key="review.id" :title-link-class="{}">
                        <template slot="title">
                            <div class="d-flex align-items-center">
                                <b-badge v-if="review.done" variant="success" class="mr-2">DONE</b-badge>
                                <b-badge v-if="!review.done" variant="danger" class="mr-2">DUE</b-badge>
                                <span>Review {{ index + 1 }}</span>
                            </div>
                        </template>

                        <PeerReview
                            :reviewId="review.id"
                            @submitEvent="fetchMetaReviews()"
                            :readOnly="readOnly"
                        ></PeerReview>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
// Reason for :title-link-class="{ }" on b-tab.
// https://github.com/bootstrap-vue/bootstrap-vue/issues/2148

import PeerReview from "./PeerReview"
import api from "../../../api_old"

export default {
    components: {
        PeerReview
    },
    data() {
        return {
            reviews: [],
            assignment: {},
            readOnly: false
        }
    },
    computed: {
        noReviews() {
            return this.reviews.length === 0
        }
    },
    async created() {
        await this.fetchMetaReviews()
        await this.fetchAssignment()

        if (new Date() > new Date(this.assignment.review_due_date)) {
            this.readOnly = true
        }
    },
    methods: {
        async fetchMetaReviews() {
            let { data } = await api.getAssignmentReviewsStudent(this.$route.params.assignmentId)
            const sortedReviews = data.sort((a, b) => a.id - b.id)
            this.reviews = sortedReviews
        },
        async fetchAssignment() {
            let { data } = await api.getAssignment(this.$route.params.assignmentId)
            this.assignment = data
        }
    }
}
</script>
