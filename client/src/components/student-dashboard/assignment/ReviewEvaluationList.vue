<template>
    <div>
        <b-card v-if="noReviews">No reviews available.</b-card>

        <b-card v-else no-body>
            <b-tabs card>
                <b-tab v-for="(peerReview, index) in peerReviews" :key="peerReview.id">
                    <template slot="title">
                        <div class="d-flex align-items-center">
                            <span>Review {{ index + 1 }}</span>
                        </div>
                    </template>
                    <ReviewEvaluation :reviewId="peerReview.review.id"></ReviewEvaluation>
                </b-tab>
            </b-tabs>
        </b-card>
    </div>
</template>

<script>
import api from "../../../api"
import ReviewEvaluation from "./ReviewEvaluation"

export default {
    components: { ReviewEvaluation },
    data() {
        return {
            // Peer reviews from others to you.
            peerReviews: []
        }
    },
    computed: {
        noReviews() {
            return this.peerReviews.length === 0
        }
    },
    async created() {
        // Retrieve reviews given to you.
        const { data: receivedIds } = await api.getFeedbackOfAssignment(this.$route.params.assignmentId)
        const receivedFlatIds = receivedIds.map(value => value.id)

        this.peerReviews = await this.foreignKeyJoinOfPeerReviews(receivedFlatIds)
    },
    methods: {
        async foreignKeyJoinOfPeerReviews(ids) {
            let peerReviews = []
            for (let i = 0; i < ids.length; i++) {
                let { data } = await api.getPeerReview(ids[i])
                peerReviews.push(data)
            }
            return peerReviews
        }
    }
}
</script>
